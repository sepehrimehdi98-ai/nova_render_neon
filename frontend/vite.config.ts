import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig(({mode})=>{const role=['student','teacher','admin'].includes(mode)?mode:'';return {define:{'import.meta.env.VITE_PORTAL_ROLE':JSON.stringify(role)},plugins:[{name:'portal-design',transformIndexHtml:{order:'pre',handler:(html:string)=>role?html.replace('/src/main.tsx','/design/'+role+'/main.tsx'):html}},react(),tailwindcss()],build:{rollupOptions:{input:role?'index.html':{main:'index.html',student:'student/index.html',teacher:'teacher/index.html',admin:'admin/index.html'}},outDir:role?'../portals/'+role+'/dist':'../backend/dist',emptyOutDir:true},server:{host:'127.0.0.1',port:5173,proxy:{'/api':'http://127.0.0.1:3003'}}}});
