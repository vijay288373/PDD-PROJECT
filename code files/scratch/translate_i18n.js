const fs = require('fs');
const path = require('path');

// 1. Target Languages
const LANGUAGE_NAMES = {
  en: "English", hi: "Hindi", bn: "Bengali", te: "Telugu", mr: "Marathi",
  ta: "Tamil", ur: "Urdu", gu: "Gujarati", kn: "Kannada", ml: "Malayalam",
  or: "Odia", sw: "Swahili", am: "Amharic", ha: "Hausa", yo: "Yoruba",
  ig: "Igbo", zu: "Zulu", fr: "French", pt: "Portuguese", es: "Spanish",
  ar: "Arabic", id: "Indonesian", vi: "Vietnamese", th: "Thai",
};

// 2. Existing translations from i18n.js lines 33-80 (already complete for all 24 languages)
const EXISTING_TRANSLATIONS = {
  app_name:            { en:"Agri Guard AI", hi:"एग्री गार्ड एआई", bn:"অ্যাগ্রি গার্ড এআই", te:"అగ్రి గార్డ్ ఏఐ", mr:"अॅग्री嚮म ऍग्री गार्ड एआय", ta:"அக்ரி கார்ட் ஏஐ", ur:"ایگری گارڈ اے آئی", gu:"એગ્રી ગાર્ડ એઆઈ", kn:"ಅಗ್ರಿ ಗಾರ್ಡ್ ಎಐ", ml:"അഗ്രി ഗാർഡ് എഐ", or:"ଅଗ୍ରି ଗାର୍ଡ ଏଆଇ", sw:"Agri Guard AI", am:"አግሪ ጋርድ ኤአይ", ha:"Agri Guard AI", yo:"Agri Guard AI", ig:"Agri Guard AI", zu:"Agri Guard AI", fr:"Agri Guard IA", pt:"Agri Guard IA", es:"Agri Guard IA", ar:"أجري جارد للذكاء الاصطناعي", id:"Agri Guard AI", vi:"Agri Guard AI", th:"แอกรี การ์ด เอไอ" },
  tagline:             { en:"Your AI Farming Assistant", hi:"आपका एआई कृषि सहायक", bn:"আপনার এআই कृषि सहायक", te:"మీ AI వ్యవసాయ సహాయకుడు", mr:"तुमचा एआय शेती सहाय्यक", ta:"உங்கள் AI விவசாய உதவியாளர்", ur:"آپ کا AI زرعی معاون", gu:"તમારા AI ખેતી સહાયક", kn:"ನಿಮ್ಮ AI ಕೃಷಿ ಸಹಾಯಕ", ml:"നിങ്ങളുടെ AI കൃഷി സഹായി", or:"ଆପଣଙ୍କ AI କୃଷି ସହାୟକ", sw:"Msaidizi Wako wa Kilimo wa AI", am:"የእርስዎ AI የእርሻ ረዳት", ha:"Mataimakin Noma AI Ku", yo:"Olùrànlọ́wọ́ Ogbin AI Rẹ", ig:"Olùrànlọ́wọ́ Ogbin AI Rẹ", zu:"Umsizi Wakho Wezolimo we-AI", fr:"Votre Assistant Agricole IA", pt:"Seu Assistente Agrícola IA", es:"Tu Asistente Agrícola IA", ar:"مساعدك الزراعي بالذكاء الاصطناعي", id:"Asisten Pertanian AI Anda", vi:"Trợ Lý Nông Nghiệp AI Của Bạn", th:"ผู้ช่วยเกษตร AI ของคุณ" },
  nav_scan:     { en:"Scan", hi:"स्कैन", bn:"স্ক্যান", te:"స్కాన్", mr:"स्कॅन", ta:"ஸ்கேன்", ur:"اسکین", gu:"સ્કેન", kn:"ಸ್ಕ್ಯಾನ್", ml:"സ്കാൻ", or:"ସ୍କ୍ୟାନ", sw:"Skani", am:"ቅኝት", ha:"Bincike", yo:"Ṣe Ayẹwo", ig:"Nyochaa", zu:"Skena", fr:"Scanner", pt:"Escanear", es:"Escanear", ar:"مسح", id:"Pindai", vi:"Quét", th:"สแกน" },
  nav_weather:  { en:"Weather", hi:"मौसम", bn:"আবহাওয়া", te:"వాతావరణం", mr:"हवामान", ta:"வானிலை", ur:"موسم", gu:"હवामान", kn:"ಹವಾಮಾನ", ml:"കാലാവസ്ഥ", or:"ପାଗ", sw:"Hali ya Hewa", am:"የአየር ሁኔታ", ha:"Yanayin Yanayi", yo:"Ojú Ọjọ", ig:"Ihu Igwe", zu:"Isimo Sezulu", fr:"Météo", pt:"Clima", es:"Clima", ar:"الطقس", id:"Cuaca", vi:"Thời tiết", th:"สภาพอากาศ" },
  nav_market:   { en:"Market", hi:"बाज़ार", bn:"বাজার", te:"మార్కెట్", mr:"बाजार", ta:"சந்தை", ur:"بازار", gu:"બજાર", kn:"ಮಾರುಕಟ್ಟೆ", ml:"മാർക്കറ്റ്", or:"ବଜାର", sw:"Soko", am:"ገበያ", ha:"Kasuwa", yo:"Ọjà", ig:"Ahia", zu:"Imakethe", fr:"Marché", pt:"Mercado", es:"Mercado", ar:"السوق", id:"Pasar", vi:"Chợ", th:"ตลาด" },
  nav_alerts:   { en:"Alerts", hi:"अलर्ट", bn:"সতর্কতা", te:"హెచ్చరికలు", mr:"सूचना", ta:"எச்சரிக்கைகள்", ur:"الرट्स", gu:"ચેતવણીઓ", kn:"ಎಚ್ಚರಿಕೆಗಳು", ml:"അലർട്ടുകൾ", or:"ସତର୍କତା", sw:"Arifa", am:"ማንቂያዎች", ha:"Faɗakarwa", yo:"Ìkìlọ̀", ig:"Ọchịchọ", zu:"Izexwayiso", fr:"Alertes", pt:"Alertas", es:"Alertas", ar:"التنبيهات", id:"Peringatan", vi:"Cảnh báo", th:"การแจ้งเตือน" },
  nav_profile:  { en:"Profile", hi:"प्रोफ़ाइल", bn:"প্রোফাইল", te:"ప్రొఫైల్", mr:"प्रोफाइल", ta:"சுயவிவரம்", ur:"پروفائل", gu:"પ્રોફાઇલ", kn:"ಪ್ರೊಫೈಲ್", ml:"പ്രൊഫൈൽ", or:"ପ୍ରୋଫାଇଲ", sw:"Wasifu", am:"መገለጫ", ha:"Bayani", yo:"Profaili", ig:"Profaili", zu:"Iphrofayili", fr:"Profil", pt:"Perfil", es:"Perfil", ar:"الملف الشخصي", id:"Profil", vi:"Hồ sơ", th:"โปรไฟล์" },
  btn_continue:     { en:"Continue", hi:"जारी रखें", bn:"চালিয়ে যান", te:"కొనసాగించు", mr:"सुरू ठेवा", ta:"தொடரவும்", ur:"جاری رکھیں", gu:"ચાલુ રાખો", kn:"ಮುಂದುवರಿಸಿ", ml:"തുടരുക", or:"ଜାରି ରଖନ୍ତୁ", sw:"Endelea", am:"ቀጥሉ", ha:"Ci gaba", yo:"Tẹ̀síwájú", ig:"Gaa n'ihu", zu:"Qhubeka", fr:"Continuer", pt:"Continuar", es:"Continuar", ar:"متابعة", id:"Lanjutkan", vi:"Tiếp tục", th:"ดำเนินการต่อ" },
  btn_save:         { en:"Save", hi:"सहेजें", bn:"সংরক্ষণ করুন", te:"సేవ్ చేయి", mr:"जतन करा", ta:"சேமி", ur:"محفوظ کریں", gu:"સાચવો", kn:"ಉಳಿಸಿ", ml:"സేവ് ചെയ്യുക", or:"ସଞ୍ଚୟ କରନ୍ତୁ", sw:"Hifadhi", am:"አስቀምጥ", ha:"Ajiye", yo:"Fipamọ́", ig:"Chekwaa", zu:"Londoloza", fr:"Enregistrer", pt:"Salvar", es:"Guardar", ar:"حفظ", id:"Simpan", vi:"Lưu", th:"บันทึก" },
  btn_share:        { en:"Share", hi:"शेयर करें", bn:"শেয়ার করুন", te:"షేర్ చేయి", mr:"शेअर करा", ta:"பகிர்", ur:"شیئر کریں", gu:"શેર કરો", kn:"ಹಂಚಿಕೊಳ್ಳಿ", ml:"പങ്കിടുക", or:"ଅଂଶୀଦାର", sw:"Shiriki", am:"አጋሩ", ha:"Raba", yo:"Pínpín", ig:"Kesaa", zu:"Yabelana", fr:"Partager", pt:"Compartilhar", es:"Compartir", ar:"مشاركة", id:"Bagikan", vi:"Chia sẻ", th:"แชร์" },
  btn_cancel:       { en:"Cancel", hi:"रद्द करें", bn:"বাতিল করুন", te:"రద్దు చేయi", mr:"रद्द करा", ta:"ரத்துசெய்", ur:"منسوخ کریں", gu:"રદ કરો", kn:"ರದ್ದುಮಾಡಿ", ml:"റദ്ദാക്കുക", or:"ବାତିଲ କରନ୍ତୁ", sw:"Ghairi", am:"ሰርዝ", ha:"Soke", yo:"Fagilé", ig:"Kagbuo", zu:"Khansela", fr:"Annuler", pt:"Cancelar", es:"Cancelar", ar:"إلغاء", id:"Batal", vi:"Hủy", th:"ยกเลิก" },
  btn_back:         { en:"Back", hi:"वापस", bn:"পিছনে", te:"వెనక్కి", mr:"मागे", ta:"பின்", ur:"پیچھے", gu:"પાછળ", kn:"ಹಿಂದे", ml:"പിന്നോട്ട്", or:"ପଛକୁ", sw:"Rudi", am:"ተመለስ", ha:"Komawa", yo:"Padà", ig:"Laghachi", zu:"Emuva", fr:"Retour", pt:"Voltar", es:"Volver", ar:"رجوع", id:"Kembali", vi:"Quay lại", th:"กลับ" },
  btn_search:       { en:"Search", hi:"खोजें", bn:"অনুসন্ধান করুন", te:"వెతుకు", mr:"शोधा", ta:"தேடு", ur:"تلاش کریں", gu:"શોધો", kn:"ಹುಡುಕಿ", ml:"തിരയുക", or:"ଖୋଜନ୍ତୁ", sw:"Tafuta", am:"ፈልግ", ha:"Bincika", yo:"Ìwádìí", ig:"Chọọ", zu:"Sesha", fr:"Rechercher", pt:"Pesquisar", es:"Buscar", ar:"بحث", id:"Cari", vi:"Tìm kiếm", th:"ค้นหา" },
  btn_sign_out:     { en:"Sign Out", hi:"साइन आउट", bn:"সাইন আউট", te:"సైన్ అవుట్", mr:"साइन आउट", ta:"வெளியேறு", ur:"سائن آؤٹ", gu:"સાઇન આઉट", kn:"ಸೈನ್ ಔಟ್", ml:"സൈൻ ഔട്ട്", or:"ସାଇନ ଆଉଟ", sw:"Toka", am:"ውጣ", ha:"Fita", yo:"Jade", ig:"Pụọ", zu:"Phuma", fr:"Se déconnecter", pt:"Sair", es:"Cerrar sesión", ar:"تسجيل الخروج", id:"Keluar", vi:"Đăng xuất", th:"ออกจากระบบ" },
  btn_edit:         { en:"Edit Profile", hi:"प्रोफ़ाइल संपादित करें", bn:"প্রোফাইল সম্পাদना", te:"ప్రొఫైల్ సవరించు", mr:"प्रोफाइल संपादित करा", ta:"சுயவிவரத்தை திருத்து", ur:"پروفائل ترمیم کریں", gu:"પ્રોફાઇલ સંપાદિત કરો", kn:"ಪ್ರೊಫైಲ್ ಸಂಪಾದಿಸಿ", ml:"പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക", or:"ପ୍ରୋଫାଇଲ ସମ୍ପାଦନ", sw:"Hariri Wasifu", am:"መገለጫ አርትዕ", ha:"Gyara Bayani", yo:"Ṣàtúnṣe Profaili", ig:"Dezie Profaili", zu:"Hlela Iphrofayili", fr:"Modifier le profil", pt:"Editar perfil", es:"Editar perfil", ar:"تعديل الملف", id:"Edit Profil", vi:"Sửa hồ sơ", th:"แก้ไขโปรไฟล์" },
  btn_scan_again:   { en:"Scan Another Plant", hi:"दूसरे पौधे को स्कैन करें", bn:"আরেকটি গাছ স্ক্যান করুন", te:"మరో మొక్కను స్కాన్ చేయి", mr:"दुसरी वनस्पती स्कॅन करा", ta:"மற்றொரு தாவரத்தை ஸ்கேன் செய்", ur:"ایک اور پودا اسکین کریں", gu:"બીજો છોડ સ્કેન કરો", kn:"ಮತ್ತೊಂದು ಸಸ್ಯ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ", ml:"മറ്റொரு സസ്യം സ്കാൻ ചെയ്യുക", or:"ଆଉ ଏକ ଉଦ୍ଭିଦ ସ୍କ୍ୟାନ କରନ୍ତୁ", sw:"Skani Mmea Mwingine", am:"ሌላ ተክል ቅኝ", ha:"Duba Wata Shuka", yo:"Ṣe Ayẹwo Ọ̀gbìn Mìíràn", ig:"Nyochaa Osisi Ọzọ", zu:"Skena Usehlakalo Olukhác", fr:"Scanner une autre plante", pt:"Escanear outra planta", es:"Escanear otra planta", ar:"مسح نبات آخر", id:"Pindai Tanaman Lain", vi:"Quét cây khác", th:"สแกนพืชอื่น" },
  btn_retry:        { en:"Tap to retry", hi:"पुनः प्रयास करें", bn:"পুনরায় চেষ্টা করুন", te:"మళ్ళీ ప్రయత్నించు", mr:"पुन्हा प्रयत्न करा", ta:"மீண்டும் முயற்சி செய்", ur:"دوبारे कोशिश करें", gu:"ફરી પ્રયાસ કરો", kn:"ಮತ್ತे ప్రయత్ನಿಸಿ", ml:"വീണ്ടും ശ്രമിക്കുക", or:"ପୁଣି ଚେଷ୍ଟा କରନ୍ତୁ", sw:"Gusa kurudia", am:"እንደገና ሞክር", ha:"Danna don sake gwadawa", yo:"Tẹ láti tún gbìyanjú", ig:"Pịa iji nwaa ọzọ", zu:"Thepha ukuphinda uzame", fr:"Appuyer pour réessayer", pt:"Toque para tentar novamente", es:"Toca para reintentar", ar:"انقر للمحاولة مجددًا", id:"Ketuk untuk mencoba lagi", vi:"Nhấn để thử lại", th:"แตะเพื่อลองใหม่" },
  btn_stop:         { en:"Stop", hi:"रुकें", bn:"বন্ধ করুন", te:"ఆపు", mr:"थांबा", ta:"நிறுத்து", ur:"روکیں", gu:"રોકો", kn:"ನಿಲ್ಲಿಸಿ", ml:"നിർത്തുക", or:"ବନ୍ଦ କରନ୍ତୁ", sw:"Simama", am:"አቁም", ha:"Tsaya", yo:"Dúró", ig:"Kwụsị", zu:"Misa", fr:"Parar", pt:"Parar", es:"Detener", ar:"إيقاف", id:"Berhenti", vi:"Dừng", th:"หยุด" },
  btn_read_aloud:   { en:"Read Aloud", hi:"ज़ोर से पढ़ें", bn:"জোরে পড়ুন", te:"బిగ్గరగా చదువు", mr:"मोठ्याने वाचा", ta:"சத்தமாக படி", ur:"اونچا پڑھیں", gu:"મોટેથી વાંચો", kn:"ಜೋರಾಗಿ ಓದಿ", ml:"ഉറക്കെ വായിക്കുക", or:"ଜୋରରେ ପଢ଼ନ୍ତୁ", sw:"Soma Kwa Sauti", am:"በጮክ ብሎ አንብብ", ha:"Karanta Daga Tsayi", yo:"Ka Sókè", ig:"Gụọ n'ụda", zu:"Funda Ngezwi", fr:"Lire à voix haute", pt:"Ler em voz alta", es:"Leer en voz alta", ar:"اقرأ بصوت عالٍ", id:"Baca Keras", vi:"Đọc to", th:"อ่านออกเสียง" },
  sec_todays_advice:   { en:"Today's Advice", hi:"आज की सलाह", bn:"আজকের পরামর্শ", te:"నేటి సలహా", mr:"आजचा सल्ला", ta:"இன்றைய ஆலோசனை", ur:"آج کا مشورہ", gu:"आजनी सलाह", kn:"ಇಂದಿನ ಸಲಹೆ", ml:"ഇന്നത്തെ ഉപദേശം", or:"ଆଜିର ପରାମର୍ଶ", sw:"Ushauri wa Leo", am:"የዛሬ ምክር", ha:"Shawarar Yau", yo:"Ìmọ̀ràn Ọjọ́ Yìí", ig:"Ndụmọdụ Taa", zu:"Iseluleko Sanamuhla", fr:"Conseils du jour", pt:"Conselho de hoje", es:"Consejo de hoy", ar:"نصيحة اليوم", id:"Saran Hari Ini", vi:"Lời khuyên hôm nay", th:"คำแนะนำวันนี้" },
  sec_quick_actions:   { en:"Quick Actions", hi:"त्वरित क्रियाएं", bn:"দ্রুত পদক্ষেপ", te:"త్వరిత చర్యలు", mr:"त्वरित क्रिया", ta:"விரைவு நடவடிக்கைகள்", ur:"فौरी اقدامات", gu:"ઝડપી ક્રિયાઓ", kn:"ತ್ವರಿತ ಕ್ರಿಯೆಗಳು", ml:"ദ്രുത പ്രവർത്തനങ്ങൾ", or:"ତ୍ୱରିତ ଦ୍ରୁତ କ୍ରିୟା", sw:"Vitendo vya Haraka", am:"ፈጣን እርምጃዎች", ha:"Matakan Sauri", yo:"Ìgbésẹ̀ Kíákíá", ig:"Omume Ngwa Ngwa", zu:"Izinyathelo Ezisheshayo", fr:"Actions rapides", pt:"Ações rápidas", es:"Acciones rápidas", ar:"إجراءات سريعة", id:"Tindakan Cepat", vi:"Hành động nhanh", th:"การดำเนินการด่วน" },
  sec_recent_scans:    { en:"Recent Scans", hi:"हाल के स्कैन", bn:"সাম্প্রতিক স্ক্যান", te:"ఇటీవలి స్కాన్లు", mr:"अलीकडील स्कॅन", ta:"சமீபத்திய ஸ்கேன்கள்", ur:"حالیہ اسکین", gu:"તાજેતરના સ્કેન", kn:"ಇತ್ತೀಚಿನ ಸ್ಕ್ಯಾನ್‌ಗಳು", ml:"സമീപകാല സ്കാനുകൾ", or:"ସଦ୍ୟ ସ୍କ୍ୟାନ", sw:"Uchunguzi wa Hivi Karibuni", am:"የቅርብ ጊዜ ቅኝቶች", ha:"Binciken Kwanan Nan", yo:"Ìwádìí Àìpẹ́", ig:"Nyocha Ọhụrụ", zu:"Ama-Scan Amuva Nje", fr:"Scans récents", pt:"Verificações recentes", es:"Escaneos recientes", ar:"الفحوصات الأخيرة", id:"Pemindaian Terbaru", vi:"Quét gần đây", th:"การสแกนล่าสุด" },
  sec_market_prices:   { en:"Market Prices", hi:"बाज़ार भाव", bn:"बाजार दर", te:"మార్కెట్ ధరలు", mr:"बाजारभाव", ta:"சந்தை விலைகள்", ur:"بازار की कीमतیں", gu:"બજાર ભાવ", kn:"ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು", ml:"മാർക്കറ്റ് വിലകൾ", or:"ବଜାର ମୂଲ୍ୟ", sw:"Bei za Soko", am:"የገበያ ዋጋዎች", ha:"Farashin Kasuwa", yo:"Iye Ọjà", ig:"Ọnụahịa Ahịa", zu:"Amanani Emakethe", fr:"Prix du marché", pt:"Preços de mercado", es:"Precios de mercado", ar:"أسعار السوق", id:"Pasar", vi:"Giá thị trường", th:"ราคาตลาด" },
  sec_alerts:          { en:"Alerts", hi:"सूचनाएं", bn:"সতর্কता", te:"హెచ్చరికలు", mr:"सूचना", ta:"எச்சரிக்கைகள்", ur:"الरट", gu:"ચેતવણીઓ", kn:"ಎಚ್ಚರಿಕೆಗಳು", ml:"അലർട്ടുകൾ", or:"ସତର୍କତା", sw:"Arifa", am:"ማንቂያዎች", ha:"Faɗakarwa", yo:"Ìkìlọ̀", ig:"Ọchịchọ", zu:"Izexwayiso", fr:"Alertes", pt:"Alertas", es:"Alertas", ar:"التنبيهات", id:"Peringatan", vi:"Cảnh báo", th:"การแจ้งเตือน" },
  sec_my_crops:        { en:"My Crops", hi:"मेरी फसलें", bn:"আমার ফসল", te:"నా పంటలు", mr:"माझी पिके", ta:"என் பயிர்கள்", ur:"मेरी फसलें", gu:"મારા પાક", kn:"ನನ್ನ ಬೆಳೆಗಳು", ml:"എന്റെ വിളകൾ", or:"ମୋ ଫସଲ", sw:"Mazao Yangu", am:"የእኔ ሰብሎች", ha:"Amfanin Gonar Ni", yo:"Àwọn Ìrè Oko Mi", ig:"Ọ́sụ́ Ọrụ m", zu:"Izitshalo Zami", fr:"Mes cultures", pt:"Minhas culturas", es:"Mis cultivos", ar:"محاصيلي", id:"Tanaman Saya", vi:"Cây trồng của tôi", th:"พืชของฉัน" },
  lbl_full_name:       { en:"Full Name", hi:"पूरा नाम", bn:"पूर्ण नाम", te:"పూర్తి పేరు", mr:"पूर्ण नाव", ta:"முழு பெயர்", ur:"پورا نام", gu:"પૂરું નામ", kn:"ಪೂರ್ಣ ಹೆಸರು", ml:"പൂർണ്ണ നാമം", or:"ପୂର୍ଣ ନାମ", sw:"Jina Kamili", am:"ሙሉ ስም", ha:"Cikakken Suna", yo:"Orúkọ Kíkún", ig:"Aha Ọ̀tụ̀tụ̀", zu:"Igama Eligcwele", fr:"Nom complet", pt:"Nome completo", es:"Nombre completo", ar:"الاسم الكامل", id:"Nama Lengkap", vi:"Họ và tên", th:"ชื่อเต็ม" },
  lbl_region:          { en:"Region / State", hi:"क्षेत्र / राज्य", bn:"অঞ্চল / রাজ্য", te:"ప్రాంతం / రాష్ట్రం", mr:"प्रदेश / राज्य", ta:"பகுதி / மாநிலம்", ur:"علاقہ / ریاست", gu:"પ્રદેશ / રાજ્ય", kn:"ಪ್ರದೇಶ / ರಾಜ್ಯ", ml:"പ്രദേശം / സംസ്ഥാനം", or:"ଅଞ୍ଚଳ / ରାଜ୍ୟ", sw:"Mkoa / Jimbo", am:"ክልል / ክፍለ ሀገር", ha:"Yanki / Jiha", yo:"Àgbègbè / Ìpínlẹ̀", ig:"Mpaghara / Steeti", zu:"Isifunda / Isifundazwe", fr:"Région / État", pt:"Região / Estado", es:"Región / Estado", ar:"المنطقة / الولاية", id:"Wilayah / Provinsi", vi:"Vùng / Tỉnh", th:"ภูมิภาค / รัฐ" },
  lbl_country:         { en:"Country", hi:"देश", bn:"দেশ", te:"దేశం", mr:"देश", ta:"நாடு", ur:"ملک", gu:"દેશ", kn:"ದೇಶ", ml:"രാജ്യം", or:"ଦେଶ", sw:"Nchi", am:"ሀገር", ha:"Ƙasa", yo:"Orílẹ̀-èdè", ig:"Mba", zu:"Izwe", fr:"Pays", pt:"País", es:"País", ar:"البلد", id:"Negara", vi:"Quốc gia", th:"ประเทศ" },
  lbl_farm_size:       { en:"Farm Size", hi:"खेत का आकार", bn:"খামারের আকার", te:"పొలం పరిమాణం", mr:"शेताचा आकार", ta:"பண்ணையின் அளவு", ur:"فार्म का साइज", gu:"ખેતરનું कद", kn:"ಫಾರ್ಮ್ ಗಾತ್ರ", ml:"ഫാം വലിപ്പം", or:"ଫାର୍ମ ଆକାର", sw:"Ukubwa wa Shamba", am:"የእርሻ መጠን", ha:"Girman Gona", yo:"Ìwọ̀n Oko", ig:"Ogo Ubi", zu:"Ubukhulu Bepulazi", fr:"Taille de la ferme", pt:"Tamanho da fazenda", es:"Tamaño de la finca", ar:"حجم المزرعة", id:"Ukuran Lahan", vi:"Diện tích trang trại", th:"ขนาดฟาร์ม" },
  lbl_language:        { en:"Language", hi:"भाषा", bn:"ভাষা", te:"భాష", mr:"भाषा", ta:"மொழி", ur:"زبان", gu:"ભાષા", kn:"ಭಾಷೆ", ml:"ഭാഷ", or:"ଭାଷା", sw:"Lugha", am:"ቋንቋ", ha:"Harshe", yo:"Èdè", ig:"Asụsụ", zu:"Ulimi", fr:"Langue", pt:"Idioma", es:"Idioma", ar:"اللغة", id:"Bahasa", vi:"Ngôn ngữ", th:"ภาษา" },
  status_loading:      { en:"Loading...", hi:"लोड हो रहा है...", bn:"লোড হচ্ছে...", te:"లోడ్ అవుతోంది...", mr:"लोड होत आहे...", ta:"ஏற்றுகிறது...", ur:"لوڈ ہو رہا ہے...", gu:"લોડ થઈ રહ્યું છે...", kn:"ಸ್ಕ್ಯಾನ್ ಆಗುತ್ತಿದೆ...", ml:"ലോഡ് ചെയ്യുന്നു...", or:"ଲୋଡ ହେଉଛି...", sw:"Inapakia...", am:"እየጫነ ነው...", ha:"Ana ɗaukar...", yo:"Ń gbéra...", ig:"Na-amanye...", zu:"Iyalayisha...", fr:"Chargement...", pt:"Carregando...", es:"Cargando...", ar:"جارٍ التحميل...", id:"Memuat...", vi:"Đang tải...", th:"กำลังโหลด..." },
  status_error:        { en:"Error", hi:"त्रुटि", bn:"त्रुटि", te:"లోపం", mr:"त्रुटी", ta:"பிழை", ur:"خرابی", gu:"ભૂલ", kn:"ದೋಷ", ml:"പിശക്", or:"ତ୍ରୁଟି", sw:"Hitilafu", am:"ስህተት", ha:"Kuskure", yo:"Àṣìṣe", ig:"Njehie", zu:"Isiphazamiso", fr:"Erreur", pt:"Erro", es:"Error", ar:"خطأ", id:"Kesalahan", vi:"Lỗi", th:"ข้อผิดพลาด" },
  status_saved:        { en:"Saved", hi:"सहेजा गया", bn:"সংরক্ষিত", te:"సేవ్ అయింది", mr:"जतन केले", ta:"சேமிக்கப்பட்டது", ur:"محفوظ", gu:"સાચવ્યું", kn:"ಉಳಿಸಲಾಗಿದೆ", ml:"സേവ് ചെയ്തു", or:"ସଞ୍ଚୟ ହୋଇଛି", sw:"Imehifadhiwa", am:"ተቀምጧል", ha:"An ajiye", yo:"Tí fipamọ́", ig:"Echekwara", zu:"Kulondoloziwe", fr:"Enregistré", pt:"Salvo", es:"Guardado", ar:"تم الحفظ", id:"Tersimpan", vi:"Đã lưu", th:"บันทึกแล้ว" },
  status_scanning:     { en:"Scanning...", hi:"स्कैन हो रहा है...", bn:"স্ক্যান করা হচ্ছে...", te:"స్కాన్ అవుతోంది...", mr:"स्कॅन करत आहे...", ta:"ஸ்கேன் செய்கிறது...", ur:"اسکین ہو رہا ہے...", gu:"સ્કેન થઈ રહ્યું છે...", kn:"ಸ್ಕ್ಯಾನ್ ಆಗುತ್ತಿದೆ...", ml:"സ്കാൻ ചെയ്യുന്നു...", or:"ସ୍କ୍ୟାନ ହେଉଛି...", sw:"Inafanya uchunguzi...", am:"እየፈተሸ ነው...", ha:"Ana yin bincike...", yo:"Ń ṣe ìwádìí...", ig:"Na-eme nyocha...", zu:"Iyaskena...", fr:"Analyse en cours...", pt:"Escaneando...", es:"Escaneando...", ar:"جارٍ الفحص...", id:"Memindai...", vi:"Đang quét...", th:"กำลังสแกน..." },
  status_no_data:      { en:"No data found", hi:"कोई डेटा नहीं मिला", bn:"কোন ডেটা পাওয়া যায়নি", te:"డేటా కనుగొనబడలేదు", mr:"डेटा आढळला नाही", ta:"தரவு கிடைக்கவில்லை", ur:"کوئی ڈیٹا نہیں ملا", gu:"કોઈ ડેટા મળ્યો નથી", kn:"ಯಾವುದೇ ಡೇಟಾ ಕಂಡುಬಂದಿಲ್ಲ", ml:"ഡേറ്റ കണ്ടെത്തിയില്ല", or:"କୌଣସି ଡାଟା ମିଳିଲା ନାହିଁ", sw:"Hakuna data iliyopatikana", am:"ምንም ውሂብ አልተገኘም", ha:"Ba a sami bayani ba", yo:"Ko sí àwọn data tí a rí", ig:"Achọtabeghị data", zu:"Akukho idatha etholakele", fr:"Aucune donnée trouvée", pt:"Nenhum dado encontrado", es:"No se encontraron datos", ar:"لم يتم العثور على بيانات", id:"Tidak ada data ditemukan", vi:"Không tìm thấy dữ liệu", th:"ไม่พบข้อมูล" },
  status_offline:      { en:"You're offline — showing saved data", hi:"आप ऑफ़लाइन हैं — सहेजा हुआ डेटा दिखा रहे हैं", bn:"আপনি অফলাইনে — সংরক্ষিত ডেটা দেখাচ্ছে", te:"మీరు ఆఫ్‌లైన్‌లో ఉన్నారు — సేవ్ చేసిన డేటా చూపిస్తోంది", mr:"तुमची ऑफलाइन आहात — जतन केलेला डेटा दाखवत आहे", ta:"நீங்கள் ஆஃப்லைனில் உள்ளீர்கள் — சேமித்த தரவைக் காட்டுகிறது", ur:"آپ آف لائن ہیں — محفوظ ڈیٹا دکھا رہا ہے", gu:"તમે ઑફ્લાઇન છો — સાचવેલ ડેટા દેખાઈ રહ્યો છે", kn:"ನೀವು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಇದ್ದೀರಿ — ಉಳಿಸಿದ ಡೇಟಾ ತೋರಿಸಲಾಗುತ್ತಿದೆ", ml:"നിങ്ങൾ ഓഫ്‌ലൈനാണ് — സേവ് ചെയ്ത ഡേറ്റ കാണിക്കുന്നു", or:"ଆପଣ ଅଫ୍‌ଲାଇନ ଅଛନ୍ତି — ସଞ୍ଚୟ ହୋଇଥିବା ଡ଼ାଟା ଦେଖାଯାଉଛି", sw:"Uko nje ya mtandao — inaonyesha data iliyohifadhiwa", am:"ከመስመር ውጭ ነዎት — የተቀመጠ ውሂብ እያሳየ ነው", ha:"Kuna kashe layi — yana nuna bayanai da aka ajiye", yo:"O wa lọ́dẹ̀ẹ́ orin — ń fihàn ìtọ́jú àwọn data", ig:"Ị nọ n'oge offline — na-egosi data echekwara", zu:"Awukhonekile — ibonisa idatha elilondoloziwe", fr:"Vous êtes hors ligne — affichage des données sauvegardées", pt:"Você está offline — exibindo dados salvos", es:"Estás sin conexión — mostrando datos guardados", ar:"أنت غير متصل — عرض البيانات المحفوظة", id:"Anda offline — menampilkan data tersimpan", vi:"Bạn đang ngoại tuyến — hiển thị dữ liệu đã lưu", th:"คุณออฟไลน์อยู่ — แสดงข้อมูลที่บันทึกไว้" },
  status_add_home:     { en:"Add to Home Screen for quick access", hi:"त्वरित पहुँच के लिए होम स्क्रीन में जोड़ें", bn:"द्रुत एक्सेस के लिए होम स्क्रीन में जोड़ें", te:"త్వరిత యాక్సెస్ కోసం హోమ్ స్క్రీన్‌కు జోడించండి", mr:"जलद प्रवेशासाठी होम स्क्रीनवर जोडा", ta:"விரைவான அணுகலுக்கு முகப்பு திரையில் சேர்க்கவும்", ur:"فوری رسائی کے لیے ہوم اسکرین में शामिल करें", gu:"ઝડપી ઍક્સેસ માટે હોમ સ્ક્રીનમાં ઉમેરો", kn:"ತ್ವರಿತ ಪ್ರವೇಶಕ್ಕಾಗಿ ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿ", ml:"വേഗത്തിലുള്ള ആക്‌സസിനായി ഹോം സ്‌ക്രീനിൽ ചേർക്കുക", or:"ଦ୍ରୁତ ଆକ୍ସେସ ପାଇଁ ହୋମ ସ୍କ୍ରିନ ଯୋଗ କରନ୍ତୁ", sw:"Ongeza kwenye Skrini ya Nyumbani kwa upatikanaji wa haraka", am:"ለፈጣን መዳረሻ ወደ መनेሻ ማሳያ ጨምር", ha:"Kara zuwa Allo na Gida don samun damar gaggawa", yo:"Fi sí Ojú ìwòran Ilé fún ìráàyèsí ìyára", ig:"Tinye na Ihuenyi Ụlọ maka nweta ngwa ngwa", zu:"Ngeza ku-Isikrini Sasekhaya ukuze ufinyelele ngokushesha", fr:"Ajouter à l'écran d'accueil pour un accès rapide", pt:"Adicionar à tela inicial para acesso rápido", es:"Añadir a la pantalla de inicio para acceso rápido", ar:"أضف إلى الشاشة الرئيسية للوصول السريع", id:"Tambahkan ke Layar Utama untuk akses cepat", vi:"Thêm vào màn hình chính để truy cập nhanh", th:"เพิ่มในหน้าจอหลักเพื่อเข้าถึงด่วน" },
};

// 3. New Keys requiring translation across all 24 languages
const NEW_KEYS_TO_TRANSLATE = {
  // --- Scan screen ---
  select_crop: "Select Your Crop",
  select_crop_desc: "Choose the crop you want to scan for diseases",
  search_crops: "Search crops...",
  no_crops_found: "No crops found for",
  cat_all: "All",
  cat_grain: "Grain",
  cat_vegetable: "Vegetable",
  cat_fruit: "Fruit",
  cat_legume: "Legume",
  cat_cash: "Cash Crop",
  cat_root: "Root",
  cat_oil: "Oil Crop",
  cat_tree: "Tree Crop",
  cat_spice: "Spice",
  camera_unavailable: "Camera not available",
  upload_gallery: "Upload from Gallery",
  scanning_label: "Scanning...",
  center_affected_part: "Center the affected part of the plant",
  diagnosis_title: "Diagnosis",
  healthy_plant: "Healthy Plant! 🌱",
  confidence_score: "Confidence Score",
  seasonal_care_tips: "Seasonal Care Tips",
  detected_disease: "Detected Disease",
  unknown_disease: "Unknown Disease",
  severity_label: "Severity",
  treatment_steps: "Treatment Steps",
  prevention_tips: "Prevention Tips",
  consult_agronomist: "Consult an Agronomist",
  consult_agronomist_desc: "This condition may require professional treatment. Contact your local agricultural extension office.",
  showing_cached_result: "Showing cached result — Sync when online",
  history_title: "Scan History",
  history_empty: "No scans recorded yet. Start scanning your crops!",

  // --- Settings ---
  notifications: "Notifications",
  units: "Units",
  about: "About",
  danger_zone: "Danger Zone",
  delete_account: "Delete Account",
  app_version: "App Version",
  how_to_use: "How to use Agri Guard AI",
  support: "Support",
  privacy_policy: "Privacy Policy",
  currency: "Currency",
  auto_detected: "auto-detected",
  delivery_time: "Delivery time",
  disease_alerts: "Disease Alerts",
  market_alerts: "Market Alerts",
  weather_alerts: "Weather Alerts",
  daily_advisory: "Daily Advisory",

  // --- LoginPage ---
  sign_in: "Sign In",
  create_account: "Create Account",
  forgot_password: "Forgot Password?",
  sign_in_to_farm: "Sign In to Farm",
  processing: "Processing...",
  quick_sandbox_access: "Quick Sandbox Access",
  use_demo_farmer: "Use Demo Farmer Account",
  simulating_entry: "Simulating Entry...",
  live_ai_diagnose: "Live AI Diagnose",
  mandi_tracking: "Mandi Tracking",
  weather_alerts_label: "Weather Alerts",
  fill_all_credentials: "Please fill in all credentials.",
  invalid_email: "Please enter a valid email address.",
  password_short: "Password must be at least 6 characters long.",
  enter_full_name: "Please enter your full name.",
  lbl_email: "Email Address",
  lbl_password: "Password",
  welcome_back: "Welcome Back! 🌾",
  logged_in_success: "Logged in successfully as Demo Farmer.",
  account_created: "Account Created! 🎉",
  welcome_user: "Welcome to Agri Guard AI",
  demo_active: "Demo Account Active! 👨‍🌾",
  demo_active_desc: "Entered as Demo Farmer. Happy farming!",

  // --- Weather ---
  Overview: "Overview",
  "Crop Impact": "Crop Impact",
  Precautions: "Precautions",
  History: "History",
  Humidity: "Humidity",
  Wind: "Wind Speed",
  "UV Index": "UV Index",
  "Soil Moisture": "Soil Moisture",
  Rainfall: "Rainfall",
  "Feels Like": "Feels Like",

  // --- Market ---
  prices_near: "Prices near",
  btn_change: "Change",
  updated_at: "Updated at",
  refresh: "Refresh",
  live_prices: "Live Prices",
  tap_forecast_hint: "Tap a crop card to view AI price forecast →",
  no_crop_selected: "No crop selected",
  no_crop_selected_desc: "Go to Live Prices and tap a crop to analyze",
  ai_intelligence: "AI Market Intelligence",
  change_prompt: "Enter market or city name:",
  market_prices: "Market Prices",
  wholesale_mandi_rates: "Wholesale Mandi Rates",
  commodity_search: "Search crops/commodities...",
  estimated: "Estimated",
  price_forecast: "Price Forecast",
  weather_history: "Weather History",
  relative_humidity: "Relative Humidity",
  wind_speed: "Wind Speed",
  rain_probability: "Rain Probability",
  uv_index: "UV Index",

  // --- Alerts Center ---
  alerts_title: "Alerts",
  alerts_new: "new",
  alerts_mark_all_read: "Mark all read",
  alerts_empty: "No alerts yet",
  alerts_caught_up: "You're all caught up!",
  alerts_no_type: "No notifications",
  filter_all: "All",
  filter_critical: "Critical",
  filter_market: "Market",
  filter_weather: "Weather",
  filter_scans: "Scans",

  // --- Profile modals ---
  profile_edit: "Edit Profile",
  profile_farmer: "Farmer",
  profile_stats: "Farmer · scans completed",
  profile_scans_singular: "Farmer · scan completed",
  profile_my_crops: "My Crops",
  profile_add_crop: "Add crop",
  profile_no_crops: "No crops added yet. Tap \"+ Add crop\" to start.",
  profile_smallholder: "Smallholder",
  profile_commercial: "Commercial",
  profile_organic: "Organic",
  profile_name_placeholder: "Your name",
  profile_region_placeholder: "e.g. Punjab, Maharashtra",
  profile_country_placeholder: "e.g. India, Kenya",
  profile_farm_size_placeholder: "e.g. 5",
  profile_farming_type_label: "Farming Type",
  profile_confirm_delete: "Delete Account?",
  profile_delete_desc: "This will permanently delete all your scan history, profile data, and alerts. This action cannot be undone.",
  profile_delete_yes: "Yes, delete my account",
  profile_delete_are_you_sure: "Are you absolutely sure?",
  profile_delete_everything: "Delete Everything",
  profile_deleting: "Deleting...",
  profile_select_crop: "Select Crop",
  profile_select_language: "Select Language",
  profile_search_language: "Search language...",
  profile_search_crops: "Search crops...",
  profile_saving: "Saving...",
};

// 4. Load API Key from .env
function loadApiKey() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return null;
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/VITE_GEMINI_API_KEY\s*=\s*(.*)/);
  return match ? match[1].trim() : null;
}

const apiKey = loadApiKey();
if (!apiKey) {
  console.error("❌ VITE_GEMINI_API_KEY not found in .env");
  process.exit(1);
}

// Helper to fetch from Gemini
async function queryGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error: ${response.status} - ${errText}`);
  }

  const json = await response.json();
  const text = json.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}

async function run() {
  console.log("🚀 Starting translation compiler...");
  const translatedDict = { ...EXISTING_TRANSLATIONS };

  // Translate in batches of 15 keys to optimize API calls and avoid context limits
  const keys = Object.keys(NEW_KEYS_TO_TRANSLATE);
  const batchSize = 15;

  for (let i = 0; i < keys.length; i += batchSize) {
    const batchKeys = keys.slice(i, i + batchSize);
    console.log(`\nTranslating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(keys.length / batchSize)}:`, batchKeys);

    const batchData = {};
    batchKeys.forEach(k => {
      batchData[k] = NEW_KEYS_TO_TRANSLATE[k];
    });

    const prompt = `You are a translation assistant specializing in agricultural and farming terminology.
Translate the following English terms/labels of an agricultural app into these target languages:
Target Languages:
${Object.entries(LANGUAGE_NAMES).map(([code, name]) => `- ${code}: ${name}`).join('\n')}

Important Context:
- Swahili, Odia, Hausa, Yoruba, Igbo, Zulu are spoken by rural farmers, so use local, natural agricultural terms where possible (e.g. Swahili "Maharagwe/Maharage" for legumes, "Kutokomeza wadudu" for treatment steps, "Bei ya soko" for market prices).
- Keep translations concise as they are UI labels, buttons, and short hints.
- Retain emojis if present (e.g. "Healthy Plant! 🌱" should have 🌱 at the end in the translated languages too).

English JSON data:
${JSON.stringify(batchData, null, 2)}

Respond with a JSON object where each key has a sub-object containing translations for ALL 24 languages listed above, including "en".
Response JSON format:
{
  "key_name": {
    "en": "...",
    "hi": "...",
    ...
  }
}`;

    let success = false;
    let retries = 3;
    while (!success && retries > 0) {
      try {
        const result = await queryGemini(prompt);
        // Verify we got all languages
        batchKeys.forEach(k => {
          if (!result[k]) {
            throw new Error(`Missing key ${k} in translation response`);
          }
          translatedDict[k] = result[k];
        });
        success = true;
      } catch (err) {
        console.warn(`⚠️ Batch failed. Retrying... (${retries} left). Error:`, err.message);
        retries--;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (!success) {
      console.error("❌ Fatal: Failed to translate batch after multiple retries.");
      process.exit(1);
    }
  }

  // 5. Generate i18n.js content
  console.log("\n📝 Translating finished! Compiling final i18n.js...");

  let fileContent = `// Language code → name mapping
export const LANGUAGE_NAMES = {
  en: "English", hi: "Hindi", bn: "Bengali", te: "Telugu", mr: "Marathi",
  ta: "Tamil", ur: "Urdu", gu: "Gujarati", kn: "Kannada", ml: "Malayalam",
  or: "Odia", sw: "Swahili", am: "Amharic", ha: "Hausa", yo: "Yoruba",
  ig: "Igbo", zu: "Zulu", fr: "French", pt: "Portuguese", es: "Spanish",
  ar: "Arabic", id: "Indonesian", vi: "Vietnamese", th: "Thai",
};

// Reverse: name → code
export const LANGUAGE_CODES = Object.fromEntries(
  Object.entries(LANGUAGE_NAMES).map(([k, v]) => [v, k])
);

// RTL languages
export const RTL_LANGUAGES = ["ar", "ur"];

// BCP-47 speech codes
export const SPEECH_CODES = {
  en: "en-US", hi: "hi-IN", bn: "bn-IN", te: "te-IN", mr: "mr-IN",
  ta: "ta-IN", ur: "ur-PK", gu: "gu-IN", kn: "kn-IN", ml: "ml-IN",
  or: "or-IN", sw: "sw-KE", am: "am-ET", ha: "ha-NG", yo: "yo-NG",
  ig: "ig-NG", zu: "zu-ZA", fr: "fr-FR", pt: "pt-BR", es: "es-ES",
  ar: "ar-SA", id: "id-ID", vi: "vi-VN", th: "th-TH",
};

// ──────────────────────────────────────────────
// Translation dictionary
// Keys used throughout the app
// ──────────────────────────────────────────────
export const TRANSLATIONS = {\n`;

  Object.entries(translatedDict).forEach(([key, langs]) => {
    fileContent += `  ${key.padEnd(20)}: ${JSON.stringify(langs)},\n`;
  });

  fileContent += `};

/**
 * Get translated text for a given key and language code.
 * Falls back to English if the code or key is not found.
 */
export function t(key, langCode = "en") {
  const entry = TRANSLATIONS[key];
  if (!entry) return key;
  return entry[langCode] || entry["en"] || key;
}

/**
 * Build the LLM language instruction suffix.
 * Returns empty string for English.
 */
export function llmLangSuffix(langCode) {
  if (!langCode || langCode === "en") return "";
  const name = LANGUAGE_NAMES[langCode] || "English";
  return \`\\n\\nIMPORTANT: Respond entirely in \${name}. Do not use any English words.\`;
}
`;

  const outputPath = path.join(__dirname, '../src/lib/i18n.js');
  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`✅ Success! Unified translations generated successfully at: ${outputPath}`);
}

run().catch(err => {
  console.error("❌ Fatal runner error:", err);
  process.exit(1);
});
