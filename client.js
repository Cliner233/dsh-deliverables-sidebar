window.__ModuleLoader__.load({
  id: '@cliner/dsh-deliverables-sidebar',
  factory(require) {
    const React = require('react'), h = React.createElement;
    const ID = '@cliner/dsh-deliverables-sidebar', NS = 'clinerDeliverables', KEY = 'clinerDeliverablesV1';
    const zh = {title:'对话交付物',intro:'汇总本对话中的文件，按产出时间排列',latest:'最新在前',oldest:'最早在前',sort:'时间排序',search:'搜索文件名或路径',all:'全部文件',presented:'明确交付',produced:'写入 / 修改',linked:'回复中的文件链接',empty:'本对话还没有交付物',hint:'明确交付、成功写入或修改的文件，以及助手回复中的本地文件链接会显示在这里。',none:'没有匹配的文件',loading:'正在读取对话交付物…',retry:'重新读取',unavailable:'暂未取得交付物数据，请重试。',count:'文件',time:'按最近一次产出时间排序',preview:'预览文件',failed:'打开失败，请重试',open:'打开交付物',filter:'文件来源'};
    const en = {title:'Conversation deliverables',intro:'Files from this conversation, ordered by output time',latest:'Newest first',oldest:'Oldest first',sort:'Time order',search:'Search filenames or paths',all:'All files',presented:'Delivered',produced:'Written / edited',linked:'Linked in replies',empty:'No deliverables yet',hint:'Explicit deliveries, successful file writes or edits, and local file links in assistant replies appear here.',none:'No matching files',loading:'Reading conversation deliverables…',retry:'Retry',unavailable:'Deliverable data is unavailable. Please retry.',count:'files',time:'Sorted by most recent output time',preview:'Preview file',failed:'Could not open file. Please retry.',open:'Open deliverables',filter:'File source'};
    const css = `.cds-root{height:100%;min-height:0;display:flex;flex-direction:column;color:var(--dsw-alias-label-primary);font:inherit;background:var(--dsw-alias-bg-base)}.cds-head{padding:20px 16px 12px;border-bottom:1px solid var(--dsw-alias-border-l1)}.cds-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.cds-heading h2{font-size:15px;font-weight:600;margin:0}.cds-count,.cds-note{font-size:12px;color:var(--dsw-alias-label-tertiary)}.cds-controls{display:flex;flex-wrap:wrap;gap:8px}.cds-root input,.cds-root select{box-sizing:border-box;min-width:0;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:7px 9px;font:inherit;font-size:12px;background:var(--dsw-alias-bg-base);color:inherit}.cds-root input{width:100%;margin-bottom:8px}.cds-root select{flex:1}.cds-root button{font:inherit;color:inherit;cursor:pointer}.cds-note{margin:10px 0 0;line-height:18px}.cds-list{list-style:none;margin:0;padding:8px;overflow:auto;flex:1;min-height:0}.cds-row{width:100%;display:flex;align-items:center;gap:10px;border:0;border-radius:10px;background:transparent;text-align:left;padding:10px 8px;min-height:54px}.cds-row:hover,.cds-utility:hover{background:var(--dsw-alias-interactive-bg-hover)}.cds-icon{flex:none;width:26px;color:var(--dsw-alias-accent)}.cds-info{min-width:0;flex:1}.cds-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;line-height:20px}.cds-meta{display:block;font-size:11px;line-height:17px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cds-empty{padding:32px 20px;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:22px;text-align:center}.cds-empty p{color:var(--dsw-alias-label-tertiary);font-size:12px}.cds-utility{display:inline-flex;align-items:center;gap:6px;border:0;background:transparent;border-radius:8px;padding:6px 8px;font-size:12px}.cds-root :focus-visible,.cds-utility:focus-visible{outline:2px solid var(--dsw-alias-accent);outline-offset:2px}.cds-error{padding:8px 16px;color:var(--dsw-alias-danger);font-size:12px}`;
    function Icon({size=20}) {return h('svg',{width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.6,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true},h('path',{d:'M7 3h7l4 4v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z'}),h('path',{d:'M14 3v5h4M9 12h6M9 16h6'}));}
    return {inject:['slots','locale','sidebarRightTabs','sidebarRight','sessions'],apply(ctx) {
      ctx.effect(()=>ctx.locale.register(NS,{zh,en}));
      const t=ctx.locale.bind(NS);
      ctx.effect(()=>ctx.sidebarRightTabs.register({id:ID,kind:'cliner-deliverables',title:()=>t('title'),guide:[{id:'files',order:35,title:()=>t('title'),description:()=>t('intro'),icon:Icon}]}));
      const preferences=new Map();
      function Panel(props) {
        const rows=props.useProjection(KEY), sid=props.sessionId;
        const [order,setOrder]=React.useState(()=>preferences.get(sid)||'desc');
        const [query,setQuery]=React.useState(''),[filter,setFilter]=React.useState('all'),[error,setError]=React.useState(''),[busy,setBusy]=React.useState(false);
        const tr=props.t || t;
        async function refresh(){setBusy(true);setError('');try{await ctx.sessions.refreshProjections(sid);}catch(e){setError(e?.message||tr('unavailable'));}finally{setBusy(false);}}
        React.useEffect(()=>{if(rows===undefined)void refresh();},[sid]);
        const values=Array.isArray(rows)?rows:[];
        const q=query.trim().toLocaleLowerCase();
        const list=React.useMemo(()=>values.filter(f=>(filter==='all'||f.source===filter)&&(!q||(f.path+' '+f.description).toLocaleLowerCase().includes(q))).slice().sort((a,b)=>(order==='asc'?1:-1)*(a.time-b.time||a.seq-b.seq)||a.path.localeCompare(b.path)),[rows,q,filter,order]);
        const names=new Map();for(const f of values){const n=f.path.split(/[\\/]/).pop();names.set(n,(names.get(n)||0)+1);}
        function open(file){setError('');try{const enc=v=>encodeURIComponent(v).replace(/%3A/gi,':');const target='dsh-resource://file/session/'+enc(sid)+'/'+file.path.replace(/\\/g,'/').split('/').map(enc).join('/');ctx.sidebarRight.openResource(target);}catch(e){setError(e?.message||tr('failed'));}}
        return h('section',{className:'cds-root','aria-label':tr('title')},h('style',null,css),
          h('header',{className:'cds-head'},h('div',{className:'cds-heading'},h('h2',null,tr('title')),h('span',{className:'cds-count','aria-live':'polite'},`${list.length} / ${values.length} ${tr('count')}`)),
          h('input',{type:'search',value:query,placeholder:tr('search'),'aria-label':tr('search'),onChange:e=>setQuery(e.target.value)}),
          h('div',{className:'cds-controls'},h('select',{'aria-label':tr('sort'),value:order,onChange:e=>{setOrder(e.target.value);preferences.set(sid,e.target.value);}},h('option',{value:'desc'},tr('latest')),h('option',{value:'asc'},tr('oldest'))),h('select',{'aria-label':tr('filter'),value:filter,onChange:e=>setFilter(e.target.value)},...['all','presented','produced','linked'].map(v=>h('option',{key:v,value:v},tr(v))))),h('p',{className:'cds-note'},tr('time'))),
          error&&h('div',{className:'cds-error',role:'alert'},error),
          rows===undefined?h('div',{className:'cds-empty',role:'status'},busy?tr('loading'):tr('unavailable'),h('div',null,h('button',{className:'cds-utility',onClick:refresh,disabled:busy},tr('retry')))):
          !list.length?h('div',{className:'cds-empty'},values.length?tr('none'):tr('empty'),!values.length&&h('p',null,tr('hint'))):
          h('ul',{className:'cds-list'},...list.map(f=>{const name=f.path.split(/[\\/]/).pop(),stamp=new Date(f.time).toLocaleString();return h('li',{key:f.id},h('button',{type:'button',className:'cds-row',title:f.path+(f.description?'\n'+f.description:''),'aria-label':tr('preview')+': '+f.path,onClick:()=>open(f)},h('span',{className:'cds-icon'},h(Icon)),h('span',{className:'cds-info'},h('span',{className:'cds-name'},name),h('span',{className:'cds-meta'},stamp+' · '+tr(f.source)+(names.get(name)>1?' · '+f.path:'')))));})))
      }
      ctx.slots.inject('sidebar.right.pane.tab',()=>ctx.slots.register({name:'sidebar.right.pane.tab',key:ID,locale:NS},Panel));
    }};
  }
});
