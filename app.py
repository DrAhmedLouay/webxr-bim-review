import streamlit as st
import streamlit.components.v1 as components
import pandas as pd
import json
import os
from datetime import datetime

# =========================================================================
# 1. إعدادات الصفحة وهوية المنصة الأكاديمية
# =========================================================================
st.set_page_config(
    page_title="منصة مراجعة التصاميم وتنسيق الـ BIM (WebXR)",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="expanded"
)

# تخصيص واجهة المستخدم بالـ CSS
st.markdown("""
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        html, body, [class*="css"] {
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            text-align: right;
        }
        .main-header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border: 1px solid rgba(56, 189, 248, 0.2);
            padding: 20px 25px;
            border-radius: 14px;
            margin-bottom: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .metric-card {
            background: rgba(30, 41, 59, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
        }
        .stButton>button {
            border-radius: 8px;
            font-weight: 600;
        }
    </style>
""", unsafe_allow_html=True)

# ترويسة المنصة
st.markdown("""
<div class="main-header">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <h1 style="color: #38bdf8; font-size: 1.6rem; margin-bottom: 5px;">🏢 منصة المراجعة الفراغية وتنسيق نماذج الـ BIM لمرحلة ما قبل البناء</h1>
            <p style="color: #94a3b8; font-size: 0.9rem; margin: 0;">
                دراسة ماجستير: توظيف تقنيات الواقع الافتراضي والمعزز كمنصات تفاعلية لمراجعة التصميم المعماري والتنسيق الفراغي
            </p>
        </div>
        <div style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; padding: 6px 14px; border-radius: 20px; color: #38bdf8; font-size: 0.85rem; font-weight: bold;">
            WebXR Cloud-BIM v2.0
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# =========================================================================
# 2. القائمة الجانبية (Sidebar Controls)
# =========================================================================
with st.sidebar:
    st.header("⚙️ لوحة التحكم والإعدادات")
    
    view_mode = st.radio(
        "اختر بيئة العرض التفاعلية:",
        [
            "🏢 استعراض نموذج مشروعك المرفوع (Speckle 3D Stream)",
            "🥽 بيئة فحص التعارضات الافتراضية (WebXR Review Lab)"
        ],
        index=0
    )
    
    st.markdown("---")
    st.subheader("📋 بيانات المشارك في التجربة")
    participant_id = st.text_input("كود المهندس المشارك:", value="P-01")
    specialty = st.selectbox("التخصص الهندسي:", ["معماري (Architecture)", "إنشائي (Structure)", "كهروميكانيك (MEP)", "إدارة تشييد (Construction)"])
    experience_years = st.slider("سنوات الخبرة العملية:", 0, 30, 5)

    st.markdown("---")
    st.info("💡 **ملاحظة للمستخدم:**\nيمكنك استخدام الفأرة للدوران والتقريب، أو فتح الرابط في نظارة **Meta Quest 3** لتجربة الواقع الافتراضي بمقياس 1:1.")

# =========================================================================
# 3. العرض ثلاثي الأبعاد الرئيسي (3D Viewport)
# =========================================================================
speckle_embed_url = "https://app.speckle.systems/projects/9634c835c9/models/36a4c21a29#embed=%7B%22hideSidebar%22%3Afalse%2C%22hideHeader%22%3Afalse%7D"

if "Speckle" in view_mode:
    st.markdown(f"""
        <div style="border-radius: 12px; overflow: hidden; border: 1px solid rgba(56, 189, 248, 0.3); box-shadow: 0 8px 30px rgba(0,0,0,0.4);">
            <iframe src="{speckle_embed_url}" width="100%" height="700" frameborder="0" allow="xr-spatial-tracking; fullscreen; accelerometer; gyroscope"></iframe>
        </div>
    """, unsafe_allow_html=True)
    st.caption("🌐 البث السحابي المباشر لنموذج مشروعك (20210219Architecture) عبر منصة Speckle Open-BIM")

else:
    # قراءة ملف index.html المطور
    current_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = os.path.join(current_dir, "index.html")
    
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            html_content = f.read()
        components.html(html_content, height=720, scrolling=False)
        st.caption("🥽 مختبر الفحص الغامر المتوافق مع معيار WebXR المفتوح")
    else:
        st.error("تعذر العثور على ملف index.html في مسار المشروع.")

# =========================================================================
# 4. أدوات القياس العلمي والبحثي للتجربة (Research Evaluation Tools)
# =========================================================================
st.markdown("<br>", unsafe_allow_html=True)
tab_clashes, tab_nasa, tab_sus, tab_export = st.tabs([
    "📋 مصفوفة رصد التعارضات (Clash Matrix)",
    "🧠 استبيان الحمل المعرفي (NASA-TLX)",
    "📊 مقياس قابلية الاستخدام (SUS Score)",
    "💾 تصدير نتائج التجربة (Export Data)"
])

# ---- TAB 1: مصفوفة التعارضات ----
with tab_clashes:
    st.markdown("#### قائمة التحقق من التعارضات المزروعة في الحالة الدراسية")
    st.write("ضع علامة صح أمام أي تعارض استطعت اكتشافه وتحديده أثناء المراجعة الفراغية:")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("**1. تعارضات صلبة قياسية (Hard Clashes)**")
        c1 = st.checkbox("CL-01: اختراق أنبوب التغذية لساق كمرة خرسانية", key="c1")
        c2 = st.checkbox("CL-02: تقاطع مجرى الهواء مع القاطع الزجاجي للبهو", key="c2")
        c3 = st.checkbox("CL-03: اقتطاع العمود الإنشائي من بئر مصعد النقالات", key="c3")
        c4 = st.checkbox("CL-04: تداخل صينية الكابلات مع ماسورة تصريف الأمطار", key="c4")
        c5 = st.checkbox("CL-05: وقوع إطار انزلاق الباب داخل عمود خرساني", key="c5")

        st.markdown("**2. تعارضات حيزية وكودية (Clearance Clashes)**")
        c6 = st.checkbox("CL-06: هبوط مجرى الهواء وتقليص خلوص ممر الإخلاء (1.95m)", key="c6")
        c7 = st.checkbox("CL-07: تصادم قوس فتح الباب مع لوحة إنذار الغازات", key="c7")
        c8 = st.checkbox("CL-08: ضيق مسافة سحب فلاتر الهواء لوحدة الـ FCU (< 15cm)", key="c8")
        c9 = st.checkbox("CL-09: إعاقة درفة صندوق خراطيم الحريق بسبب تجليد جداري", key="c9")
        c10 = st.checkbox("CL-10: مرور ماسورة صرف فوق الحيز المخصص للوحة الكهرباء", key="c10")

    with col2:
        st.markdown("**3. تعارضات تشغيلية وصيانة (Operability Clashes)**")
        c11 = st.checkbox("CL-11: محبس عزل أكسجين مرتفع جداً (3.2m) دون فتحة تفتيش", key="c11")
        c12 = st.checkbox("CL-12: ضيق حيز مرفقي الجراح أمام حوض التعقيم الجداري", key="c12")
        c13 = st.checkbox("CL-13: حامل أنابيب يعيق فتح باب لوحة التوزيع بدرجة 90", key="c13")
        c14 = st.checkbox("CL-14: فتحة صيانة السقف تقع مباشرة تحت مجرى هواء ضخم", key="c14")
        c15 = st.checkbox("CL-15: منعطف ممر ضيق يعيق دوران عربة النفايات الطبية", key="c15")

        st.markdown("**4. تعارضات إدراكية وبيئية (Ergonomic & Sightlines)**")
        c16 = st.checkbox("CL-16: عمود إنشائي يحجب خط رؤية الممرض لسرير العزل", key="c16")
        c17 = st.checkbox("CL-17: وحدة إضاءة مركزية تسلط وهجاً مبهراً على عين المريض", key="c17")
        c18 = st.checkbox("CL-18: حجب لوحة مخارج الطوارئ الإرشادية بقاطع معلق", key="c18")
        c19 = st.checkbox("CL-19: نافذة غرفة تنويم تكشف مباشرة مكاتب الإدارة المجاورة", key="c19")
        c20 = st.checkbox("CL-20: محطة شد إنذار الحريق خلف درابزين تعيق ذوي الإعاقة", key="c20")

    clashes_detected = sum([c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16, c17, c18, c19, c20])
    detection_rate = (clashes_detected / 20) * 100
    
    st.metric("📊 إجمالي التعارضات المكتشفة", f"{clashes_detected} من 20", f"{detection_rate:.1f}% نسبة الرصد")

# ---- TAB 2: استبيان NASA-TLX ----
with tab_nasa:
    st.markdown("#### استبيان الحمل المعرفي والإدراكي (NASA Task Load Index)")
    st.write("حدد مستوى الجهد الذهني والتعب الذي شعرت به أثناء استخدام البيئة لمراجعة التصميم (من 0 إلى 100):")
    
    col_n1, col_n2 = st.columns(2)
    with col_n1:
        mental = st.slider("1. الجهد الذهني الفكري (Mental Demand):", 0, 100, 35)
        physical = st.slider("2. الجهد البدني والحركي (Physical Demand):", 0, 100, 20)
        temporal = st.slider("3. الضغط الزمني والشعور بالعجلة (Temporal Demand):", 0, 100, 30)
    with col_n2:
        performance = st.slider("4. الرضا عن مستوى أدائك (Performance - 0 ممتاز، 100 فاشل):", 0, 100, 25)
        effort = st.slider("5. مستوى المحاولة والجهد الكلي (Effort):", 0, 100, 40)
        frustration = st.slider("6. مستوى الإحباط والتوتر (Frustration Level):", 0, 100, 15)

    nasa_score = (mental + physical + temporal + performance + effort + frustration) / 6
    st.metric("🧠 متوسط الحمل المعرفي (NASA-TLX Score)", f"{nasa_score:.1f} / 100", 
              "حمل منخفض ومريح" if nasa_score < 40 else ("حمل متوسط" if nasa_score < 65 else "حمل مرتفع ومرهق"))

# ---- TAB 3: استبيان SUS ----
with tab_sus:
    st.markdown("#### مقياس سهولة وقابلية استخدام النظام (System Usability Scale - SUS)")
    st.write("قيم مدى اتفاقك مع العبارات التالية (1: أعارض بشدة | 5: أتفق بشدة):")
    
    sus_items = [
        "1. أعتقد أنني سأحب استخدام هذا النظام في مشاريعي المستقبلية.",
        "2. وجدت النظام معقداً بشكل غير ضروري.",
        "3. كان النظام سهل الاستخدام بشكل عام.",
        "4. أعتقد أنني سأحتاج لمساعدة خبير تقني لأتمكن من استخدام هذا النظام.",
        "5. وظائف وأدوات النظام كانت متكاملة ومنسجمة بشكل ممتاز.",
        "6. وجدت أن هناك الكثير من التناقضات في عمل النظام.",
        "7. أتصور أن معظم المهندسين سيتعلمون استخدام هذا النظام بسرعة بالغة.",
        "8. وجدت النظام مربكاً أو غير مريح في الاستخدام.",
        "9. شعرت بالثقة التامة أثناء استخدام وتجربة النظام.",
        "10. احتجت لتعلم أشياء كثيرة قبل أن أتمكن من البدء في استخدام النظام."
    ]
    
    sus_scores = []
    col_s1, col_s2 = st.columns(2)
    for i, item in enumerate(sus_items):
        target_col = col_s1 if i < 5 else col_s2
        with target_col:
            val = st.radio(item, [1, 2, 3, 4, 5], index=3, horizontal=True, key=f"sus_{i}")
            # احتساب معادلة SUS القياسية
            if i % 2 == 0:
                sus_scores.append(val - 1)
            else:
                sus_scores.append(5 - val)

    final_sus = sum(sus_scores) * 2.5
    st.metric("📈 درجة قابلية الاستخدام (SUS Score)", f"{final_sus:.1f} / 100",
              "ممتاز جداً (Grade A)" if final_sus >= 80 else ("جيد ومقبول (Grade B)" if final_sus >= 68 else "يحتاج تحسين"))

# ---- TAB 4: تصدير النتائج ----
with tab_export:
    st.markdown("#### حفظ وتصدير نتائج الجلسة التجريبية")
    st.write("اضغط الزر أدناه لتوليد ملف CSV يحتوي على كافة بيانات الاختبار لتحليله إحصائياً في فصول الرسالة:")
    
    session_data = {
        "Timestamp": [datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
        "Participant_ID": [participant_id],
        "Specialty": [specialty],
        "Experience_Years": [experience_years],
        "View_Mode": [view_mode],
        "Clashes_Detected": [clashes_detected],
        "Detection_Rate_Percent": [f"{detection_rate:.1f}%"],
        "NASA_TLX_Score": [round(nasa_score, 2)],
        "SUS_Score": [round(final_sus, 2)]
    }
    
    df_session = pd.DataFrame(session_data)
    st.dataframe(df_session, use_container_width=True)
    
    csv_bytes = df_session.to_csv(index=False).encode('utf-8-sig')
    st.download_button(
        label="📥 تحميل تقرير الجلسة (Download Session CSV)",
        data=csv_bytes,
        file_name=f"BIM_Review_Session_{participant_id}.csv",
        mime="text/csv"
    )
