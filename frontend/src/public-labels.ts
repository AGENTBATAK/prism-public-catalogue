import i18n from './i18n';
export function applyPublicLabels() {
  i18n.addResourceBundle('en', 'translation', {
    publicCatalogueLabel: 'PUBLIC CATALOGUE', genericPdfCover: 'Generic cover · not a page preview',
    pagesPending: 'Page count not supplied', viewSourcePage: 'View NCPOR source page', openPdf: 'Open PDF on NCPOR',
    publicCatalogueNotice: 'Browse 787 reports from the supplied catalogue. Covers are generic. PDFs open on the original NCPOR repository and may load slowly. Links have not all been checked for availability. This catalogue is a snapshot, not a live NCPOR feed.',
    libraryIntro: 'Search report titles, authors and handles; filter by year, expedition or research domain. Original documents stay with NCPOR.',
    catalogCoverage: '{{catalogued}} catalogue entries link to their original source. Document contents are not indexed here.',
    cataloguedPending: 'Source link · catalogue metadata', indexStatus: 'Catalogue status',
    checkArchivePath: 'Try a broader search or clear the filters.', offline: 'The catalogue could not be loaded. Please reload the page.',
    localArchive: 'SOURCE CATALOGUE', galleryLiveData: 'SUPPLIED CATALOGUE SNAPSHOT', galleryImported: 'bundled gallery images',
    galleryExpeditionsNote: 'Expedition numbers represented in the supplied catalogue.', galleryGrowth: 'Catalogue reports', galleryGrowthNote: 'Report years represented in the supplied catalogue.',
    stationDataNote: 'Profiles use published NCPOR information. Counts match station names in the supplied catalogue metadata.',
    stationsIntro: 'Explore India’s polar research bases and related reports from the source catalogue.',
    localFeatureTitle: 'Available in the local PRISM app', localFeatureNotice: 'This public prototype supports catalogue browsing and original-source links. PDF indexing, OCR, document AI, sign-in and Story Forge require the local app.',
  }, true, true);
  i18n.addResourceBundle('hi', 'translation', {
    publicCatalogueLabel: 'सार्वजनिक सूची', genericPdfCover: 'सामान्य कवर · PDF पृष्ठ का पूर्वावलोकन नहीं',
    pagesPending: 'पृष्ठ संख्या नहीं दी गई है', viewSourcePage: 'NCPOR स्रोत पृष्ठ देखें', openPdf: 'NCPOR पर PDF खोलें',
    publicCatalogueNotice: 'दी गई सूची के 787 रिपोर्ट ब्राउज़ करें। कवर सामान्य हैं। PDF मूल NCPOR रिपॉज़िटरी पर खुलते हैं और धीमे लोड हो सकते हैं। सभी लिंक की उपलब्धता जाँची नहीं गई है। यह सूची एक स्नैपशॉट है, लाइव फ़ीड नहीं।',
    libraryIntro: 'शीर्षक, लेखक और हैंडल खोजें; वर्ष, अभियान और विषय से फ़िल्टर करें। मूल दस्तावेज़ NCPOR पर हैं।',
    catalogCoverage: '{{catalogued}} सूची प्रविष्टियाँ मूल स्रोत से जुड़ी हैं। दस्तावेज़ों की सामग्री यहाँ अनुक्रमित नहीं है।',
    cataloguedPending: 'स्रोत लिंक · सूची मेटाडेटा', indexStatus: 'सूची स्थिति', checkArchivePath: 'व्यापक खोज करें या फ़िल्टर हटाएँ।',
    localArchive: 'स्रोत सूची', galleryLiveData: 'दी गई सूची का स्नैपशॉट', galleryImported: 'वेबसाइट में शामिल गैलरी चित्र',
    galleryExpeditionsNote: 'दी गई सूची में दर्शाए गए अभियान क्रमांक।', galleryGrowth: 'सूची रिपोर्ट', galleryGrowthNote: 'दी गई सूची में रिपोर्ट के वर्ष।',
    stationDataNote: 'प्रोफ़ाइल प्रकाशित NCPOR जानकारी पर आधारित हैं। रिपोर्ट संख्या दी गई सूची में स्टेशन नामों के मिलान से है।',
    stationsIntro: 'भारत के ध्रुवीय अनुसंधान केंद्र और संबंधित स्रोत रिपोर्ट देखें।',
    localFeatureTitle: 'स्थानीय PRISM ऐप में उपलब्ध', localFeatureNotice: 'यह सार्वजनिक प्रोटोटाइप सूची और मूल स्रोत लिंक प्रदान करता है। PDF अनुक्रमण, OCR, AI, साइन-इन और Story Forge के लिए स्थानीय ऐप चाहिए।',
  }, true, true);
}
