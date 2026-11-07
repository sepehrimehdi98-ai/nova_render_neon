'use strict';
async function learningRoutes({ q, u, route, req, data, url, scope, lessonScope, send, res, fail, id, integer }) {
    let m = route.match(/^\/lessons\/([^/]+)\/activity$/);
    if (m && req.method === 'POST') {
        if (u.role !== 'student')
            fail(403, 'فقط دانش‌آموز فعالیت ثبت می‌کند.');
        const lesson = await lessonScope(q, u, m[1]);
        const version = integer(data.version, 1, 1000000);
        if (version !== lesson.published_version)
            fail(409, 'نسخه درس تغییر کرده است.');
        const event = id(data.eventId);
        const seconds = integer(data.seconds, 0, 15);
        // Lock an existing parent row: a clock row may not exist on the first pulse.
        if (q.postgres) await q.one('SELECT id FROM nova_users WHERE id=? FOR UPDATE', [u.id]);
        if (data.foreground !== true)
            fail(400, 'فقط فعالیت صفحه قابل مشاهده ثبت می‌شود.');
        const old = await q.one('SELECT * FROM nova_activity_events WHERE id=?', [event]);
        if (old) {
            if (old.user_id !== u.id || old.lesson_id !== lesson.id || old.version !== version)
                fail(409, 'شناسه رویداد تکراری است.');
            return send(res, 200, { acceptedSeconds: old.accepted_seconds, kind: 'lesson_activity' });
        }
        const clock = await q.one('SELECT * FROM nova_activity_clock WHERE user_id=?' + (q.postgres ? ' FOR UPDATE' : ''), [u.id]);
        const at = Date.now();
        const accepted = clock && clock.lesson_id === lesson.id ? Math.min(15, Math.max(0, Math.floor((at - Number(clock.last_at)) / 1000)), seconds) : 0;
        await q.run('INSERT INTO nova_activity_clock(user_id,lesson_id,last_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET lesson_id=excluded.lesson_id,last_at=excluded.last_at', [u.id, lesson.id, at]);
        await q.run('INSERT INTO nova_activity_events(id,user_id,lesson_id,version,accepted_seconds,created_at) VALUES(?,?,?,?,?,?)', [event, u.id, lesson.id, version, accepted, new Date().toISOString()]);
        return send(res, 200, { acceptedSeconds: accepted, kind: 'lesson_activity', videoWatchTimeMeasured: false });
    }
    m = route.match(/^\/lessons\/([^/]+)\/grading$/);
    if (m && req.method === 'GET') {
        const lesson = await lessonScope(q, u, m[1]);
        return send(res, 200, { jobs: await q.all(`SELECT p.id,p.user_id,p.version,p.created_at,g.status,g.score,g.passed,g.total,g.updated_at FROM nova_practice p LEFT JOIN nova_grading_jobs g ON g.submission_id=p.id WHERE p.lesson_id=?${u.role === 'student' ? ' AND p.user_id=?' : ''} ORDER BY p.created_at DESC LIMIT 100`, u.role === 'student' ? [lesson.id, u.id] : [lesson.id]), executionMode: 'isolated-worker-required' });
    }
    m = route.match(/^\/courses\/([^/]+)\/analysis$/);
    if (m && req.method === 'GET') {
        const cid = id(m[1]);
        await scope(q, u, cid);
        if (u.role === 'student')
            fail(403, 'تحلیل کلاس فقط برای مدرس و مدیر است.');
        const students = await q.all(`SELECT u.id,u.name,e.status,
 (SELECT COUNT(*) FROM nova_lessons l WHERE l.course_id=e.course_id AND l.status='published') AS lessons,
 (SELECT COUNT(*) FROM nova_progress p JOIN nova_lessons l ON l.id=p.lesson_id WHERE l.course_id=e.course_id AND l.status='published' AND p.user_id=u.id AND p.version=l.published_version AND p.completed_at IS NOT NULL) AS completed,
 (SELECT AVG(a.score) FROM nova_attempts a JOIN nova_lessons l ON l.id=a.lesson_id WHERE l.course_id=e.course_id AND a.user_id=u.id) AS quiz_average,
 (SELECT COUNT(*) FROM nova_practice p JOIN nova_lessons l ON l.id=p.lesson_id WHERE l.course_id=e.course_id AND p.user_id=u.id) AS submissions,
 (SELECT AVG(r.grade) FROM nova_reviews r JOIN nova_practice p ON p.id=r.submission_id JOIN nova_lessons l ON l.id=p.lesson_id WHERE l.course_id=e.course_id AND p.user_id=u.id) AS teacher_average,
 (SELECT AVG(g.score) FROM nova_grading_jobs g JOIN nova_practice p ON p.id=g.submission_id JOIN nova_lessons l ON l.id=p.lesson_id WHERE l.course_id=e.course_id AND p.user_id=u.id AND g.status='completed') AS automatic_average,
 (SELECT SUM(a.accepted_seconds) FROM nova_activity_events a JOIN nova_lessons l ON l.id=a.lesson_id WHERE l.course_id=e.course_id AND a.user_id=u.id) AS activity_seconds
 FROM nova_enrollments e JOIN nova_users u ON u.id=e.user_id WHERE e.course_id=? ORDER BY u.name LIMIT 500`, [cid]);
        const rows = students.map(s => ({ ...s, lessons: Number(s.lessons), completed: Number(s.completed), submissions: Number(s.submissions), activity_seconds: Number(s.activity_seconds || 0), quiz_average: s.quiz_average === null ? null : Number(s.quiz_average), teacher_average: s.teacher_average === null ? null : Number(s.teacher_average), automatic_average: s.automatic_average === null ? null : Number(s.automatic_average) }));
        const daily = await q.all("SELECT substr(a.created_at,1,10) AS day,SUM(a.accepted_seconds) AS seconds FROM nova_activity_events a JOIN nova_lessons l ON l.id=a.lesson_id WHERE l.course_id=? AND a.created_at>=? GROUP BY substr(a.created_at,1,10) ORDER BY day", [cid, new Date(Date.now() - 30 * 86400000).toISOString()]);
        return send(res, 200, { students: rows, daily, videoWatchSeconds: null, activityDefinition: 'Server-bounded foreground lesson heartbeats; not proof of watching or attention.', gradingConfigured: Boolean(process.env.NOVA_GRADER_IMAGE), generatedAt: new Date().toISOString() });
    }
    return null;
}
module.exports = { learningRoutes };
