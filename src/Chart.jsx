import React,{useEffect,useRef} from 'react';
import * as echarts from 'echarts/core';
import {LineChart} from 'echarts/charts';
import {GridComponent,TooltipComponent,DataZoomComponent,MarkPointComponent} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import {fmt,summarize} from './data.mjs';
echarts.use([LineChart,GridComponent,TooltipComponent,DataZoomComponent,MarkPointComponent,CanvasRenderer]);
export default function Chart({rows}){
 const el=useRef();const chart=useRef();
 useEffect(()=>{chart.current=echarts.init(el.current,null,{renderer:'canvas'});const observer=new ResizeObserver(()=>chart.current?.resize());observer.observe(el.current);return()=>{observer.disconnect();chart.current.dispose();chart.current=null;};},[]);
 useEffect(()=>{const s=summarize(rows);chart.current.setOption({animation:false,textStyle:{fontFamily:'system-ui'},grid:{left:55,right:30,top:35,bottom:80},tooltip:{trigger:'axis',backgroundColor:'#162333',borderColor:'#294052',textStyle:{color:'#e9f0f7'},formatter:p=>{const r=p[0]?.value;return r?`${fmt(r[0],true)}<br/>${r[1].toFixed(2)} 金／人民幣`:'';}},xAxis:{type:'time',axisLabel:{color:'#93a4b8',formatter:v=>{const d=new Date(v+8*3600000);return `${d.getUTCMonth()+1}/${d.getUTCDate()}\n${String(d.getUTCHours()).padStart(2,'0')}:00`;}},axisLine:{lineStyle:{color:'#324253'}},splitLine:{show:true,lineStyle:{color:'#22303e',type:'dashed'}},minInterval:3600000},yAxis:{type:'value',min:s?s.low[1]-.5:0,max:s?s.high[1]+.5:1,axisLabel:{color:'#93a4b8',formatter:v=>v.toFixed(2)},splitLine:{lineStyle:{color:'#22303e',type:'dashed'}}},dataZoom:[{type:'inside',zoomOnMouseWheel:false},{type:'slider',bottom:8,height:20,borderColor:'#294052',fillerColor:'#65dec421',handleStyle:{color:'#65dec4'},textStyle:{color:'#93a4b8'}}],series:[{type:'line',data:rows,showSymbol:false,lineStyle:{color:'#65dec4',width:2},areaStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#65dec430'},{offset:1,color:'#65dec400'}])},markPoint:{symbol:'circle',symbolSize:8,label:{show:true,formatter:p=>p.value.toFixed(2),color:'#e9f0f7',position:'top'},data:s?[{coord:s.high,value:s.high[1],itemStyle:{color:'#fa726f'}},{coord:s.low,value:s.low[1],itemStyle:{color:'#52dfb1'},label:{position:'bottom'}},{coord:s.last,value:s.last[1],itemStyle:{color:'#438feb'}}]:[]}}]},true);},[rows]);
 return <div className="chart" ref={el} role="img" aria-label={`金價曲線，共 ${rows.length} 筆紀錄。可拖曳下方時間軸縮放。`}/>;
}
