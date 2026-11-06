// Configure these two values from your Supabase project before enabling live features.
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabaseReady = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("YOUR_") && !SUPABASE_ANON_KEY.includes("YOUR_");
const db = supabaseReady ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let isSignup = false;
let currentLang = "fa";

const $ = (id) => document.getElementById(id);
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),3000)}
function openModal(id){$(id).hidden=false}
function closeModals(){document.querySelectorAll(".modal-backdrop").forEach(x=>x.hidden=true)}
document.querySelectorAll("[data-close]").forEach(x=>x.addEventListener("click",closeModals));
document.querySelectorAll(".modal-backdrop").forEach(x=>x.addEventListener("click",e=>{if(e.target===x)closeModals()}));
$("loginOpen").onclick=()=>openModal("authModal");
$("heroRegister").onclick=()=>openModal("enrollModal");
$("menuToggle").onclick=()=>$("mainNav").classList.toggle("open");
$("authSwitch").onclick=()=>{isSignup=!isSignup;$("authTitle").textContent=isSignup?"ساخت حساب کاربری":"ورود به حساب";$("authSubmit").textContent=isSignup?"ثبت‌نام":"ورود";$("fullName").required=isSignup;$("fullName").style.display=isSignup?"block":"none";$("authSwitch").textContent=isSignup?"قبلاً حساب ساخته‌ای؟ وارد شو":"حساب نداری؟ ثبت‌نام کن";$("authMessage").textContent=""};
$("fullName").style.display="none";
$("authForm").addEventListener("submit",async e=>{
 e.preventDefault();const email=$("email").value.trim(),password=$("password").value;
 if(!db){$("authMessage").textContent="برای فعال‌شدن ورود واقعی، آدرس و کلید Supabase را در app.js وارد کن. راهنما در README است.";return}
 $("authMessage").textContent="لطفاً صبر کنید...";
 try{
  if(isSignup){const {data,error}=await db.auth.signUp({email,password,options:{data:{full_name:$("fullName").value.trim()}}});if(error)throw error;$("authMessage").textContent="حساب ایجاد شد. اگر تأیید ایمیل فعال است، ایمیلت را بررسی کن."}
  else{const {error}=await db.auth.signInWithPassword({email,password});if(error)throw error;$("authMessage").textContent="ورود موفق بود.";toast("با موفقیت وارد شدی.");setTimeout(closeModals,900)}
 }catch(err){$("authMessage").textContent=err.message}
});
document.querySelectorAll("[data-course]").forEach(btn=>btn.addEventListener("click",()=>{$("enrollCourse").value=btn.dataset.course;openModal("enrollModal")}));
$("enrollForm").addEventListener("submit",async e=>{
 e.preventDefault();const request={full_name:$("enrollName").value.trim(),phone:$("enrollPhone").value.trim(),course:$("enrollCourse").value,note:$("enrollNote").value.trim()};
 if(!db){$("enrollMessage").textContent="فرم نمایشی آماده است؛ برای ذخیره واقعی، ابتدا Supabase را طبق README متصل کن.";return}
 $("enrollMessage").textContent="در حال ارسال...";
 try{const {error}=await db.from("enrollments").insert(request);if(error)throw error;$("enrollMessage").textContent="درخواست شما ثبت شد. آموزشگاه با شما تماس می‌گیرد.";e.target.reset()}
 catch(err){$("enrollMessage").textContent="ثبت درخواست انجام نشد: "+err.message}
});
async function loadAnnouncements(){
 if(!db)return;
 const {data,error}=await db.from("announcements").select("id,title,body,created_at").eq("is_published",true).order("created_at",{ascending:false});
 if(error){console.error(error);return}
 if(!data.length)return;
 $("announcementList").innerHTML=data.map(item=>`<article class="announcement"><span class="notice-dot"></span><div><b>${escapeHTML(item.title)}</b><p>${escapeHTML(item.body)}</p><small>${new Date(item.created_at).toLocaleDateString("fa-IR")}</small></div></article>`).join("");
}
function escapeHTML(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("langToggle").onclick=()=>{
 currentLang=currentLang==="fa"?"en":"fa";const en=currentLang==="en";document.body.classList.toggle("english",en);document.documentElement.lang=en?"en":"fa";document.documentElement.dir=en?"ltr":"rtl";$("langToggle").textContent=en?"FA":"EN";
 document.querySelectorAll("[data-fa]").forEach(el=>el.textContent=el.dataset[en?"en":"fa"]);
 toast(en?"English navigation enabled":"زبان فارسی فعال شد");
};
loadAnnouncements();
if(db){db.auth.onAuthStateChange((_event,session)=>{if(session)console.info("Signed in",session.user.email)})}
