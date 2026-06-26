"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown, IndianRupee, ShoppingCart, Users, RotateCcw } from "lucide-react";

async function fetchOverview() {
  const res = await fetch("/admin/api/v1/analytics/overview");
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:"#f59e0b", CONFIRMED:"#3b82f6", PROCESSING:"var(--brand-500)",
  SHIPPED:"#10b981", DELIVERED:"#059669", CANCELLED:"#ef4444", REFUNDED:"#9ca3af",
};

const KPIS = [
  { title:"Total Revenue",   key:"totalRevenue",   changeKey:"revenueGrowth",  icon:IndianRupee,  color: "var(--brand-600)", bg: "var(--brand-50)",   fmt:(v:number)=>formatCurrency(v) },
  { title:"Total Orders",    key:"totalOrders",    changeKey:"ordersGrowth",   icon:ShoppingCart, color:"#ec4899", bg:"rgba(236,72,153,0.08)",   fmt:(v:number)=>formatNumber(v) },
  { title:"New Customers",   key:"totalCustomers", changeKey:"customersGrowth",icon:Users,        color:"#0891b2", bg:"rgba(6,182,212,0.08)",    fmt:(v:number)=>formatNumber(v) },
  { title:"Refund Rate",     key:"refundRate",     changeKey:"refundRateChange",icon:RotateCcw,   color:"#d97706", bg:"rgba(245,158,11,0.08)",   fmt:(v:number)=>`${v.toFixed(2)}%`, invert:true },
];

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useQuery({ queryKey:["analytics-overview"], queryFn:fetchOverview, refetchInterval:120000 });

  const stats = data?.data?.stats;
  const revenueChart = data?.data?.revenueChart || [];
  const orderDist = data?.data?.orderDistribution || [];
  const customerGrowth = data?.data?.customerGrowth || [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h1 style={{ fontSize:20, fontWeight:700, color:"var(--text-primary)" }}>Analytics</h1>
        <p style={{ fontSize:13, color:"var(--text-muted)", marginTop:2 }}>Performance insights — last 30 days</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        {KPIS.map((kpi, i) => {
          const val = stats?.[kpi.key as keyof typeof stats];
          const change = stats?.[kpi.changeKey as keyof typeof stats] as number|undefined;
          const pos = kpi.invert ? (change||0)<=0 : (change||0)>=0;
          return (
            <motion.div key={kpi.title} className="card" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                <span style={{fontSize:11,fontWeight:500,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.06em"}}>{kpi.title}</span>
                <div style={{width:34,height:34,borderRadius:9,background:kpi.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <kpi.icon size={14} style={{color:kpi.color}}/>
                </div>
              </div>
              {isLoading ? (
                <><div className="skeleton" style={{height:26,width:"55%",marginBottom:6}}/><div className="skeleton" style={{height:14,width:"40%"}}/></>
              ) : (
                <>
                  <div style={{fontSize:22,fontWeight:800,color:"var(--text-primary)",letterSpacing:"-0.03em",marginBottom:6}}>
                    {val !== undefined ? kpi.fmt(Number(val)) : "—"}
                  </div>
                  {change !== undefined && (
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      {pos ? <TrendingUp size={11} style={{color:"#10b981"}}/> : <TrendingDown size={11} style={{color:"#ef4444"}}/>}
                      <span style={{fontSize:12,color:pos?"#10b981":"#ef4444",fontWeight:600}}>{Math.abs(change).toFixed(1)}%</span>
                      <span style={{fontSize:12,color:"var(--text-muted)"}}>vs last period</span>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <motion.div className="card" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"var(--text-primary)"}}>Revenue & Orders</div>
            <div style={{fontSize:12,color:"var(--text-muted)",marginTop:2}}>Daily performance overview</div>
          </div>
          <div style={{display:"flex",gap:3,background:"var(--bg-app)",border:"1px solid var(--border)",borderRadius:9,padding:3}}>
            {[7,14,30,90].map((d)=>(
              <button key={d} onClick={()=>setDays(d)}
                style={{padding:"3px 10px",borderRadius:7,fontSize:11,fontWeight:600,border:"none",cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",background:days===d?"var(--gradient)":"transparent",color:days===d?"white":"var(--text-muted)"}}>
                {d}d
              </button>
            ))}
          </div>
        </div>
        {isLoading ? <div className="skeleton" style={{height:280}}/> : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueChart.slice(-days)}>
              <defs>
                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-500)" stopOpacity={0.18}/>
                  <stop offset="95%" stopColor="var(--brand-500)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)"/>
              <XAxis dataKey="date" tick={{fill:"#9ca3af",fontSize:11}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
              <YAxis tick={{fill:"#9ca3af",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={(v)=>`₹${(v/1000).toFixed(0)}k`}/>
              <Tooltip contentStyle={{background:"#fff",border:"1px solid var(--border)",borderRadius:10,fontSize:12,boxShadow:"0 8px 24px rgba(0,0,0,0.08)"}} formatter={(v:any,name)=>[name==="revenue"?formatCurrency(Number(v)):v,name==="revenue"?"Revenue":"Orders"]}/>
              <Area type="monotone" dataKey="revenue" stroke="var(--brand-500)" strokeWidth={2.5} fill="url(#revG)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Bottom Charts */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <motion.div className="card" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.15}}>
          <div style={{fontSize:14,fontWeight:700,color:"var(--text-primary)",marginBottom:4}}>Order Status Distribution</div>
          <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:20}}>Breakdown of all orders</div>
          {isLoading ? <div className="skeleton" style={{height:220}}/> : (
            <div style={{display:"flex",alignItems:"center",gap:20}}>
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={orderDist} dataKey="count" cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={2}>
                    {orderDist.map((e:any,i:number)=><Cell key={i} fill={STATUS_COLORS[e.status]||"var(--brand-500)"}/>)}
                  </Pie>
                  <Tooltip contentStyle={{background:"#fff",border:"1px solid var(--border)",borderRadius:10,fontSize:12}}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                {orderDist.map((s:any)=>(
                  <div key={s.status} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{width:8,height:8,borderRadius:2,background:STATUS_COLORS[s.status]||"var(--brand-500)",flexShrink:0}}/>
                      <span style={{fontSize:12,color:"var(--text-secondary)"}}>{s.status.charAt(0)+s.status.slice(1).toLowerCase().replace("_"," ")}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:11,color:"var(--text-muted)"}}>{s.count}</span>
                      <span style={{fontSize:12,fontWeight:700,color:"var(--text-primary)"}}>{s.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div className="card" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
          <div style={{fontSize:14,fontWeight:700,color:"var(--text-primary)",marginBottom:4}}>Customer Growth</div>
          <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:20}}>New customers over time</div>
          {isLoading ? <div className="skeleton" style={{height:220}}/> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={customerGrowth.filter((_:any,i:number)=>i%3===0)} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)"/>
                <XAxis dataKey="date" tick={{fill:"#9ca3af",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"#9ca3af",fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"#fff",border:"1px solid var(--border)",borderRadius:10,fontSize:12,boxShadow:"0 8px 24px rgba(0,0,0,0.08)"}}/>
                <defs>
                  <linearGradient id="bG2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-500)"/><stop offset="100%" stopColor="var(--brand-400)"/>
                  </linearGradient>
                </defs>
                <Bar dataKey="newCustomers" fill="url(#bG2)" radius={[4,4,0,0]} name="New Customers"/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
}
