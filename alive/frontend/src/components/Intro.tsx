import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function Intro({ ready, image }: { ready: boolean; image?: string }) {
  const reduced = useReducedMotion()
  const [visible,setVisible]=useState(()=>!sessionStorage.getItem('alive-intro-seen')&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [assetReady,setAssetReady]=useState(false)
  const panel=useRef<HTMLDialogElement>(null)
  const paper=useRef<HTMLDivElement>(null)
  const dark=useRef<HTMLDivElement>(null)
  const entrance=useRef<gsap.core.Timeline|null>(null)
  const reveal=useRef<gsap.core.Timeline|null>(null)
  const done=useRef(false)
  useEffect(()=>{
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)')
    if(preference.matches){done.current=true;sessionStorage.setItem('alive-intro-seen','1')}
    const changed=()=>{if(preference.matches){done.current=true;sessionStorage.setItem('alive-intro-seen','1');setVisible(false)}}
    preference.addEventListener('change',changed)
    return()=>preference.removeEventListener('change',changed)
  },[])
  const finish=useCallback((skip=false)=>{
    if(done.current)return
    done.current=true;sessionStorage.setItem('alive-intro-seen','1')
    entrance.current?.kill()
    if(reduced){setVisible(false);return}
    gsap.set(dark.current,{opacity:0});gsap.set(paper.current,{clipPath:'inset(0% 0% 0% 0%)'})
    reveal.current=gsap.timeline({onComplete:()=>setVisible(false)})
      .to(paper.current,{clipPath:'inset(100% 0% 0% 0%)',duration:skip?.32:1.0,ease:'power3.inOut'},0)
      .to('.intro-controls',{opacity:0,duration:.2},0)
    const elements=document.querySelectorAll('[data-intro-enter]')
    if(elements.length)reveal.current.fromTo(elements,{y:25,opacity:.1},{y:0,opacity:1,duration:.65,stagger:.07,ease:'power3.out'},skip?0:.25)
  },[reduced])
  useEffect(()=>{
    if(!visible||reduced)return
    const dialog=panel.current;dialog?.showModal()
    entrance.current=gsap.timeline().fromTo(paper.current,{clipPath:'inset(0% 100% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.25,ease:'power2.inOut'},.12)
    const timeout=setTimeout(()=>finish(),3200)
    return()=>{clearTimeout(timeout);entrance.current?.kill();reveal.current?.kill();gsap.set('[data-intro-enter]',{clearProps:'opacity,transform'});dialog?.close()}
  },[visible,reduced,finish])
  useEffect(()=>{
    if(!image)return
    let active=true;const picture=new Image()
    picture.onload=picture.onerror=()=>{if(active)setAssetReady(true)};picture.src=image
    return()=>{active=false;picture.onload=picture.onerror=null}
  },[image])
  useEffect(()=>{
    if(!visible||!ready||(image&&!assetReady))return
    const timer=setTimeout(()=>finish(),reduced?0:1600)
    return()=>clearTimeout(timer)
  },[visible,ready,image,assetReady,reduced,finish])
  if(!visible||reduced)return null
  return <dialog ref={panel} className="intro intro--reconstructed" aria-label="Introducing a.l.i.v.e" onCancel={event=>{event.preventDefault();finish(true)}}>
    <div ref={dark} className="intro-black"/>
    <div ref={paper} className="intro-paper"><div className="intro-center"><div className="intro-word">a.l.i.v.e</div><p>actual life, in fragments.</p></div></div>
    <div className="intro-controls"><span role="status">{ready&&assetReady?'The archive is ready':'Opening the archive'}</span><button className="text-button" onClick={()=>finish(true)}>Skip intro</button></div>
  </dialog>
}
