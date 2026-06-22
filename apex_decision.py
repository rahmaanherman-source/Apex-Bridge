"""
╔══════════════════════════════════════════════════════════════════╗
║  GODSPEED SOVEREIGN — APEX DECISION ENGINE                       ║
║  AUTHOR: Rahmann Herman  |  © 2026 All Rights Reserved           ║
║  FINGERPRINT: EE5B5C7F4C6FBE64                                   ║
╚══════════════════════════════════════════════════════════════════╝
"""
__author__      = "Rahmann Herman"
__copyright__   = "© 2026 Rahmann Herman. All Rights Reserved."
__fingerprint__ = "EE5B5C7F4C6FBE64"

import json
from datetime import datetime
from dataclasses import dataclass, asdict

@dataclass
class MacroInput:
    cpi: float; pce: float; wage_growth: float
    yield_2y: float; yield_10y: float; yield_3m: float
    vix: float; credit_spread: float; gdp_nowcast: float
    oil_price: float; repo_rate: float; fed_funds: float

@dataclass
class SentimentInput:
    fear_greed_index: float; social_sentiment: float
    volatility_cluster: bool; behavioral_anomaly: bool
    fx_volatility: float

@dataclass
class DecisionOutput:
    timestamp: str; action: str; comms_mode: str
    confidence: float; risk_level: str; reasoning: list
    constellation: dict; psychology: dict; asymmetry: dict
    sentinel_signal: str; raw_scores: dict

class ConstellationModule:
    def analyze(self, macro):
        s = {}
        inf = (macro.cpi + macro.pce + macro.wage_growth) / 3
        s["inflation"] = {"score": min(100,(inf-2)*20),"status":"red"} if inf>4 else {"score":min(60,(inf-2)*15),"status":"yellow"} if inf>2.5 else {"score":max(0,inf*5),"status":"green"}
        c2_10 = macro.yield_10y - macro.yield_2y
        c3m_10 = macro.yield_10y - macro.yield_3m
        if c2_10<0 or c3m_10<0:
            s["yields"]={"score":min(100,50+abs(min(c2_10,c3m_10))*30),"status":"red"}
        elif c2_10<0.5:
            s["yields"]={"score":40,"status":"yellow"}
        else:
            s["yields"]={"score":max(0,20-c2_10*5),"status":"green"}
        gap = abs(macro.repo_rate - macro.fed_funds)
        s["liquidity"]={"score":min(100,gap*150),"status":"red"} if gap>0.25 else {"score":45,"status":"yellow"} if gap>0.10 else {"score":15,"status":"green"}
        s["spreads"]={"score":min(100,macro.credit_spread/3),"status":"red"} if macro.credit_spread>200 else {"score":50,"status":"yellow"} if macro.credit_spread>120 else {"score":max(0,macro.credit_spread/4),"status":"green"}
        s["growth"]={"score":min(100,abs(macro.gdp_nowcast)*25),"status":"red"} if macro.gdp_nowcast<0 else {"score":35,"status":"yellow"} if macro.gdp_nowcast<1 else {"score":max(0,10-macro.gdp_nowcast*3),"status":"green"}
        oil = max(0,(macro.oil_price-80)/120*100) if macro.oil_price>80 else 0
        s["global_risk"]={"score":round(oil),"status":"red" if oil>70 else "yellow" if oil>40 else "green"}
        s["_overall"]=round(sum(v["score"] for v in s.values())/len(s),1)
        return s

class PsychologyModule:
    def analyze(self, sentiment, vix):
        fg = sentiment.fear_greed_index
        if fg<20: state,intensity="Extreme Fear",(20-fg)/20
        elif fg<40: state,intensity="Fear",(40-fg)/40
        elif fg<60: state,intensity="Neutral",abs(fg-50)/50
        elif fg<80: state,intensity="Greed",(fg-60)/40
        else: state,intensity="Extreme Greed",(fg-80)/20
        conf=0
        if sentiment.volatility_cluster: conf+=35
        if sentiment.behavioral_anomaly: conf+=35
        conf+=(30 if vix>30 else 15 if vix>20 else 0)
        if conf>60: state="Confusion"
        return {"state":state,"fear_greed_index":round(fg,1),"intensity":round(min(1.0,intensity),2),"confusion_score":conf,"vix_level":"elevated" if vix>25 else "moderate" if vix>15 else "low","social_sentiment":round(sentiment.social_sentiment,2),"anomaly_detected":sentiment.behavioral_anomaly,"volatility_clustering":sentiment.volatility_cluster}

class AsymmetryModule:
    def analyze(self, c, p, macro):
        down,df,up,uf=0,[],0,[]
        if c["yields"]["status"]=="red": down+=30; df.append("Yield curve inversion — recession signal")
        if c["spreads"]["status"]=="red": down+=25; df.append("Credit spreads elevated — stress in credit markets")
        if c["liquidity"]["status"]=="red": down+=20; df.append("Liquidity stress — repo market disruption")
        if p["state"] in ["Extreme Fear","Confusion"]: down+=15; df.append(f"Psychology: {p['state']}")
        if macro.vix>35: down+=10; df.append(f"VIX critical: {macro.vix}")
        if c["inflation"]["status"]=="green": up+=20; uf.append("Inflation stabilizing — Fed flexibility improving")
        if c["growth"]["status"]=="green": up+=25; uf.append("GDP growth holding — expansion intact")
        if p["state"]=="Extreme Fear" and macro.vix>30: up+=20; uf.append("Fear extremes often precede reversal opportunities")
        if macro.credit_spread<100: up+=15; uf.append("Credit spreads contained — system functioning")
        ratio=down/max(up,1)
        if ratio>3: cls="Critical — Catastrophic Risk Dominant"
        elif ratio>2: cls="High — Downside Heavily Dominant"
        elif ratio>1.2: cls="Moderate — Downside Slightly Dominant"
        elif ratio>0.8: cls="Balanced — Risk/Opportunity Even"
        else: cls="Opportunity — Upside Dominant"
        return {"downside_score":down,"upside_score":up,"ratio":round(ratio,2),"classification":cls,"downside_factors":df,"upside_factors":uf,"catastrophic_risk":down>60}

class PreemptiveModule:
    def analyze(self, c, a, p):
        overall=c["_overall"]; ratio=a["ratio"]
        red=sum(1 for k,v in c.items() if k!="_overall" and isinstance(v,dict) and v.get("status")=="red")
        if a["catastrophic_risk"] or red>=4 or overall>75:
            return {"action":"Preemptive Intervention","urgency":"Immediate","description":"System stress critical. Act before cascade.","red_dimensions":red,"overall_stress":round(overall,1)}
        elif red>=2 or overall>55 or ratio>2:
            return {"action":"Early Adjustment","urgency":"High","description":"Multiple stress signals. Adjust ahead of market recognition.","red_dimensions":red,"overall_stress":round(overall,1)}
        elif red>=1 or overall>35 or p["state"] in ["Extreme Fear","Confusion"]:
            return {"action":"Hold + Monitor","urgency":"Moderate","description":"Stress present. Monitor for escalation. Ready to act.","red_dimensions":red,"overall_stress":round(overall,1)}
        return {"action":"Hold","urgency":"Low","description":"System stable. No action required.","red_dimensions":red,"overall_stress":round(overall,1)}

class CommsModule:
    def analyze(self, p, pr, a):
        if pr["urgency"]=="Immediate" or a["ratio"]>3: mode,rat="Clarity","Crisis requires decisive communication. No mixed signals."
        elif p["confusion_score"]>60: mode,rat="Ambiguity","High confusion. Measured language prevents panic amplification."
        elif pr["urgency"]=="High" and a["ratio"]>2: mode,rat="Clarity","Elevated risk demands clear direction."
        elif p["state"]=="Extreme Greed": mode,rat="Ambiguity","Overheated psychology. Measured language prevents escalation."
        else: mode,rat="Clarity","Standard conditions. Clear communication preferred."
        return {"mode":mode,"rationale":rat,"tone":"Direct + Decisive" if mode=="Clarity" else "Measured + Deliberate"}

class StabilityModule:
    def analyze(self, macro, a, c):
        triggers=[]; override=False
        if macro.vix>45: triggers.append(f"VIX extreme: {macro.vix}"); override=True
        if macro.credit_spread>400: triggers.append("Credit spreads 2008-level"); override=True
        if a["catastrophic_risk"] and c["_overall"]>80: triggers.append("Max stress — system at edge"); override=True
        if macro.repo_rate-macro.fed_funds>0.5: triggers.append("Repo spike — funding breakdown risk"); override=True
        lvl="OMEGA" if override else "HIGH" if c["_overall"]>65 else "MODERATE" if c["_overall"]>40 else "LOW"
        return {"override_active":override,"stability_level":lvl,"systemic_triggers":triggers,"recommended_sentinel_mode":"Omega" if override else "Auto" if lvl=="HIGH" else "Active"}

class GodspeedDecisionEngine:
    def __init__(self):
        self.constellation=ConstellationModule()
        self.psychology=PsychologyModule()
        self.asymmetry=AsymmetryModule()
        self.preemptive=PreemptiveModule()
        self.comms=CommsModule()
        self.stability=StabilityModule()

    def run(self, macro: MacroInput, sentiment: SentimentInput) -> DecisionOutput:
        C=self.constellation.analyze(macro)
        P=self.psychology.analyze(sentiment, macro.vix)
        A=self.asymmetry.analyze(C, P, macro)
        PR=self.preemptive.analyze(C, A, P)
        CM=self.comms.analyze(P, PR, A)
        S=self.stability.analyze(macro, A, C)
        action="Max Stability" if S["override_active"] else PR["action"]
        comms_mode="Clarity" if S["override_active"] else CM["mode"]
        pen=(0.15 if P["confusion_score"]>60 else 0)+(0.10 if A["ratio"]>3 else 0)+(0.05 if S["override_active"] else 0)
        confidence=round(max(0.5, 0.95-pen), 2)
        risk="Critical" if S["override_active"] else "High" if C["_overall"]>65 else "Moderate" if C["_overall"]>40 else "Low"
        reasoning=[PR["description"]]+A["downside_factors"][:2]+[f"COMMS → {comms_mode}: {CM['rationale']}"]+S["systemic_triggers"]
        return DecisionOutput(
            timestamp=datetime.utcnow().isoformat()+"Z",
            action=action, comms_mode=comms_mode, confidence=confidence,
            risk_level=risk, reasoning=reasoning, constellation=C,
            psychology=P, asymmetry=A, sentinel_signal=S["recommended_sentinel_mode"],
            raw_scores={"constellation_overall":C["_overall"],"confusion_score":P["confusion_score"],"asymmetry_ratio":A["ratio"],"downside":A["downside_score"],"upside":A["upside_score"],"red_dimensions":PR["red_dimensions"],"stability_override":S["override_active"]}
        )

    def to_json(self, output: DecisionOutput) -> str:
        return json.dumps(asdict(output), indent=2, default=str)

if __name__ == "__main__":
    engine = GodspeedDecisionEngine()
    macro = MacroInput(cpi=3.8,pce=3.2,wage_growth=4.1,yield_2y=4.85,yield_10y=4.20,yield_3m=5.30,vix=28.5,credit_spread=165,gdp_nowcast=1.4,oil_price=88.0,repo_rate=5.35,fed_funds=5.25)
    sentiment = SentimentInput(fear_greed_index=32.0,social_sentiment=-0.3,volatility_cluster=True,behavioral_anomaly=False,fx_volatility=9.2)
    out = engine.run(macro, sentiment)
    print(f"\n🔱 GODSPEED\nACTION:     {out.action}\nCOMMS:      {out.comms_mode}\nRISK:       {out.risk_level}\nCONFIDENCE: {out.confidence*100:.0f}%\nSENTINEL:   {out.sentinel_signal}")
    for r in out.reasoning: print(f"  → {r}")
    print("🔱 GODSPEED.")
"""
╔══════════════════════════════════════════════════════════════════╗
║  GODSPEED SOVEREIGN — SPINE API                                  ║
║  AUTHOR: Rahmann Herman  |  © 2026 All Rights Reserved           ║
║  FINGERPRINT: EE5B5C7F4C6FBE64                                   ║
╚══════════════════════════════════════════════════════════════════╝
"""
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import os
from apex_decision import GodspeedDecisionEngine, MacroInput, SentimentInput

app = FastAPI(title="GODSPEED Sovereign API", version="1.0.0")
engine = GodspeedDecisionEngine()
API_KEY = os.getenv("GODSPEED_API_KEY", "godspeed-dev-key")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class MacroPayload(BaseModel):
    cpi: float; pce: float; wage_growth: float
    yield_2y: float; yield_10y: float; yield_3m: float
    vix: float; credit_spread: float; gdp_nowcast: float
    oil_price: float; repo_rate: float; fed_funds: float

class SentimentPayload(BaseModel):
    fear_greed_index: float; social_sentiment: float
    volatility_cluster: bool; behavioral_anomaly: bool
    fx_volatility: float

class DecisionRequest(BaseModel):
    macro: MacroPayload
    sentiment: SentimentPayload

def verify_key(x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

@app.get("/health")
def health():
    return {"status": "live", "system": "GODSPEED Sovereign", "timestamp": datetime.utcnow().isoformat()+"Z"}

@app.post("/decision")
def run_decision(req: DecisionRequest, x_api_key: str = Header(None)):
    verify_key(x_api_key)
    macro = MacroInput(**req.macro.dict())
    sentiment = SentimentInput(**req.sentiment.dict())
    out = engine.run(macro, sentiment)
    return {"action": out.action, "comms_mode": out.comms_mode, "confidence": out.confidence, "risk_level": out.risk_level, "sentinel_signal": out.sentinel_signal, "reasoning": out.reasoning, "raw_scores": out.raw_scores, "timestamp": out.timestamp}

@app.get("/decision/sample")
def sample_decision(x_api_key: str = Header(None)):
    verify_key(x_api_key)
    macro = MacroInput(cpi=3.8,pce=3.2,wage_growth=4.1,yield_2y=4.85,yield_10y=4.20,yield_3m=5.30,vix=28.5,credit_spread=165,gdp_nowcast=1.4,oil_price=88.0,repo_rate=5.35,fed_funds=5.25)
    sentiment = SentimentInput(fear_greed_index=32.0,social_sentiment=-0.3,volatility_cluster=True,behavioral_anomaly=False,fx_volatility=9.2)
    out = engine.run(macro, sentiment)
    return {"action": out.action, "comms_mode": out.comms_mode, "confidence": out.confidence, "risk_level": out.risk_level, "sentinel_signal": out.sentinel_signal, "reasoning": out.reasoning}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("spine_api:app", host="0.0.0.0", port=8000, reload=True)
