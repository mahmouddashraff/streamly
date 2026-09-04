export type Locale = "ar" | "en";

export const dictionaries = {
  ar: {
    // Brand
    brand: "شاهد الحدث اليوم",
    producer: "إنتاج فهد علي",
    landingHero: "كل يوم في حدث في اليوم",

    // Navigation
    exclusive: "حصري",
    todaysEvent: "حدث في اليوم",
    presenters: "مذيعين",
    podcast: "بودكاست",
    channels: "قنوات",
    guests: "ضيوف",
    soon: "قريباً",
    downloadApp: "حمل التطبيق",

    // Actions & UI
    watchNow: "شاهد الآن",
    myList: "قائمتي",
    saved: "تم الحفظ",
    addToMyList: "أضف إلى قائمتي",
    removeFromMyList: "إزالة من قائمتي",
    searchPlaceholder: "عناوين، أشخاص، قنوات...",
    noVideos: "لا توجد مقاطع فيديو متاحة.",
    noDescription: "لا يوجد وصف متاح.",
    noResults: "لا توجد نتائج بحث.",
    noChannels: "لا توجد قنوات متاحة.",
    noGuests: "لا يوجد ضيوف متاحين.",
    noPresenters: "لا يوجد مذيعين متاحين.",
    loading: "جاري التحميل...",
    share: "مشاركة",
    copied: "تم النسخ!",
    backToBrowse: "العودة للتصفح",

    // My List
    myListEmptyTitle: "قائمتك فارغة",
    myListEmptyDescription: "أضف البرامج والأفلام إلى قائمتك حتى تتمكن من العثور عليها بسهولة لاحقًا.",
    exploreContent: "استكشف المحتوى",

    // Rows & Sections
    latestReleases: "أحدث الإصدارات",
    trendingNow: "رائج الآن",
    popularMovies: "أفلام شهيرة",
    latestEpisodes: "أحدث الحلقات",
    youMayAlsoLike: "قد يعجبك أيضا",
    
    // Search Groups
    videos: "فيديوهات",
    videosResult: "فيديوهات",
    podcastsResult: "بودكاست",
    guestsResult: "ضيوف",
    presentersResult: "مذيعين",
    channelsResult: "قنوات",

    // Metadata
    duration: "المدة",
    year: "السنة",
    movie: "فيلم",
    episode: "حلقة",
    season: "موسم",
    guest: "ضيف",
    presenter: "مذيع",
    episodes: "حلقات",
    latestContent: "أحدث المحتوى",

    // Auth
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    signOut: "تسجيل الخروج",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    noAccount: "ليس لديك حساب؟ إنشاء حساب",
    haveAccount: "لديك حساب بالفعل؟ تسجيل الدخول",
    signInToWatch: "سجّل الدخول لمشاهدة هذا الفيديو",
    signInToUseMyList: "سجّل الدخول لاستخدام قائمتي",
    dashboard: "لوحة التحكم",
    signingIn: "جاري تسجيل الدخول...",
    signingUp: "جاري إنشاء الحساب...",
    signingOut: "جاري تسجيل الخروج...",
    requiredFields: "الرجاء تعبئة جميع الحقول",
    passwordMismatch: "كلمات المرور غير متطابقة",
    
    // Forgot Password Flow
    sendVerificationCode: "إرسال رمز التحقق",
    verifyCode: "تحقق من الرمز",
    enterCodeSent: "أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك الإلكتروني",
    verifyCodeBtn: "تحقق",
    resendCode: "إعادة إرسال الرمز",
    createNewPassword: "إنشاء كلمة مرور جديدة",
    resetPassword: "إعادة تعيين كلمة المرور",
    passwordResetSuccess: "تمت إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.",
    invalidPin: "رمز غير صالح",
    pinExpired: "انتهت صلاحية الرمز",
    tooManyAttempts: "محاولات كثيرة جداً",
    newPassword: "كلمة المرور الجديدة",
    checkEmailForCode: "تحقق من بريدك الإلكتروني للحصول على رمز التحقق.",
    processing: "جاري المعالجة...",
    
    // Download App
    downloadAppDesc: "تحميل الموقع",
    downloadAppSubdesc: "ثبّت الموقع على هاتفك للوصول إليه بسرعة.",
    android: "أندرويد",
    androidStep1: "افتح الموقع باستخدام Google Chrome.",
    androidStep2: "اضغط على النقاط الثلاث في أعلى اليمين.",
    androidStep3: "اختر \"تثبيت التطبيق\" أو \"إضافة إلى الشاشة الرئيسية\".",
    androidStep4: "اضغط على \"تثبيت\" أو \"إضافة\".",
    androidFinal: "سيظهر الموقع الآن على الشاشة الرئيسية لهاتفك.",
    iphone: "آيفون",
    iphoneStep1: "افتح الموقع باستخدام Safari.",
    iphoneStep2: "اضغط على زر المشاركة.",
    iphoneStep3: "مرر لأسفل واختر \"إضافة إلى الشاشة الرئيسية\".",
    iphoneStep4: "اضغط على \"إضافة\".",
    iphoneFinal: "سيظهر الموقع الآن على الشاشة الرئيسية لهاتف iPhone.",
  },
  en: {
    // Brand
    brand: "Watch Today's Event",
    producer: "production house by fahd ali",
    landingHero: "Every Day, Something Happens",

    // Navigation
    exclusive: "Exclusive",
    todaysEvent: "Today's Event",
    presenters: "Presenters",
    podcast: "Podcast",
    channels: "Channels",
    guests: "Guests",
    soon: "Soon",
    downloadApp: "Download App",

    // Actions & UI
    watchNow: "Watch Now",
    myList: "My List",
    saved: "Saved",
    addToMyList: "Add to My List",
    removeFromMyList: "Remove from My List",
    searchPlaceholder: "Titles, people, channels...",
    noVideos: "No videos available.",
    noDescription: "No description available.",
    noResults: "No search results found.",
    noChannels: "No channels available.",
    noGuests: "No guests available.",
    noPresenters: "No presenters available.",
    loading: "Loading...",
    share: "Share",
    copied: "Copied!",
    backToBrowse: "Back to Browse",

    // My List
    myListEmptyTitle: "Your list is empty",
    myListEmptyDescription: "Add shows and movies to your list so you can easily find them later. Build your personal watchlist.",
    exploreContent: "Explore Content",

    // Rows
    latestReleases: "Latest Releases",
    trendingNow: "Trending Now",
    popularMovies: "Popular Movies",
    latestEpisodes: "Latest Episodes",
    youMayAlsoLike: "You May Also Like",

    // Search Groups
    videos: "Videos",
    videosResult: "Videos",
    podcastsResult: "Podcasts",
    guestsResult: "Guests",
    presentersResult: "Presenters",
    channelsResult: "Channels",

    // Metadata
    duration: "Duration",
    year: "Year",
    movie: "Movie",
    episode: "Episode",
    season: "Season",
    guest: "Guest",
    presenter: "Presenter",
    episodes: "Episodes",
    latestContent: "Latest Content",

    // Auth
    signIn: "Sign In",
    signUp: "Create Account",
    signOut: "Sign Out",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account? Create one",
    haveAccount: "Already have an account? Sign in",
    signInToWatch: "Sign in to watch this video",
    signInToUseMyList: "Sign in to use My List",
    dashboard: "Dashboard",
    signingIn: "Signing in...",
    signingUp: "Creating account...",
    signingOut: "Signing out...",
    requiredFields: "Please fill all required fields",
    passwordMismatch: "Passwords do not match",

    // Forgot Password Flow
    sendVerificationCode: "Send verification code",
    verifyCode: "Verify Code",
    enterCodeSent: "Enter the 6-digit code sent to your email",
    verifyCodeBtn: "Verify code",
    resendCode: "Resend code",
    createNewPassword: "Create New Password",
    resetPassword: "Reset password",
    passwordResetSuccess: "Password reset successfully. You can now sign in.",
    invalidPin: "Invalid PIN",
    pinExpired: "PIN expired",
    tooManyAttempts: "Too many attempts",
    newPassword: "New password",
    checkEmailForCode: "We sent a verification code to your email.",
    processing: "Processing...",
    
    // Download App
    downloadAppDesc: "Download the Website",
    downloadAppSubdesc: "Install the website on your mobile device for quick access.",
    android: "Android",
    androidStep1: "Open the website using Google Chrome.",
    androidStep2: "Tap the three dots (⋮) in the top-right corner.",
    androidStep3: "Select \"Install app\" or \"Add to Home screen\".",
    androidStep4: "Tap \"Install\" or \"Add\".",
    androidFinal: "The website will now appear on your Android home screen.",
    iphone: "iPhone",
    iphoneStep1: "Open the website in Safari.",
    iphoneStep2: "Tap the Share button.",
    iphoneStep3: "Scroll down and select \"Add to Home Screen\".",
    iphoneStep4: "Tap \"Add\".",
    iphoneFinal: "The website will now appear on your iPhone home screen.",
  }
};

export type TranslationKey = keyof typeof dictionaries.en;

export function getLocalizedField<T extends Record<string, any>>(
  obj: T,
  field: string,
  locale: Locale
): string {
  if (!obj) return "";
  const locField = `${field}_${locale}`;
  
  // Safe fallback: Since legacy fields (like 'title') are in English, 
  // it is ONLY safe to fallback to them when the user's language is English.
  // We NEVER fallback to legacy fields for Arabic to prevent English bleeding.
  if (locale === "en") {
    return obj[locField] || obj[field] || "";
  }
  
  return obj[locField] || "";
}
