const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function createCompiler(aliases={}) {
 const cache=new Map();
 function compile(relative) {
  let file=path.resolve(relative);
  if(!path.extname(file)) file+=fs.existsSync(file+'.ts')?'.ts':'.tsx';
  if(cache.has(file))return cache.get(file).exports;
  const mod=new Module(file,module);mod.paths=Module._nodeModulePaths(process.cwd());cache.set(file,mod);
  const original=mod.require.bind(mod);
  mod.require=id=>{
   if(id==='server-only')return{};
   if(id in aliases)return aliases[id];
   if(id.endsWith('.module.css'))return new Proxy({},{get:(_,key)=>String(key)});
   if(id.startsWith('@/'))return compile(id.slice(2));
   if(id.startsWith('.'))return compile(path.resolve(path.dirname(file),id));
   return original(id);
  };
  mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,
   target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
  return mod.exports;
 }
 return compile;
}
module.exports={createCompiler};
