import { LearnTopic } from '../api';

export const lessons: Record<'en' | 'hi', LearnTopic[]> = {
  en: [
    {
      id: 'ice-cores', title: 'Ice cores: Earth’s time capsule', tag: 'ICE & CLIMATE', minutes: '5 min',
      summary: 'Snow can build up in layers. As it turns to ice, tiny air bubbles and dust can be sealed inside. Scientists study these clues to learn how the atmosphere and climate changed long ago.',
      activity: 'Draw a stack of ten “snow years”. Add one clue a scientist might measure in each layer, then circle which clues are observations and which are guesses.',
      question: 'Why is it useful to compare an old ice layer with a new one?', search: 'ice core',
      sources: [
        { title: 'Captured in ice', organization: 'Science Learning Hub – Pokapū Akoranga Pūtaiao, University of Waikato', url: 'https://www.sciencelearn.org.nz/resources/2712-captured-in-ice' },
        { title: 'The climate of the past', organization: 'Discovering Antarctica · Royal Geographical Society (with IBG)', url: 'https://discoveringantarctica.org.uk/oceans-atmosphere-landscape/a-changing-climate/the-climate-of-the-past/' },
      ],
    },
    {
      id: 'food-webs', title: 'A tiny start to a giant food web', tag: 'OCEAN LIFE', minutes: '4 min',
      summary: 'Tiny drifting plants called phytoplankton use sunlight. Small animals such as krill eat them, and fish, penguins, seals and whales can depend on animals farther down the food web. The links show how living things share energy.',
      activity: 'Make a food-web sketch with arrows from food to eater. Add krill, a penguin and a whale, then ask what other evidence you would need to complete the web.',
      question: 'If one food source became harder to find, which animals might notice first?', search: 'krill',
      sources: [
        { title: 'Antarctic life and ecosystems', organization: 'Science Learning Hub – Pokapū Akoranga Pūtaiao, University of Waikato', url: 'https://www.sciencelearn.org.nz/resources/antarctic-life-and-ecosystems' },
        { title: 'Ecosystems and foodwebs', organization: 'Discovering Antarctica · Royal Geographical Society (with IBG)', url: 'https://discoveringantarctica.org.uk/ecosystems-and-foodwebs/' },
      ],
    },
    {
      id: 'field-science', title: 'How do scientists collect clues?', tag: 'FIELD SCIENCE', minutes: '4 min',
      summary: 'A scientist might use a notebook, a thermometer, a weather station or a data logger. Repeating measurements carefully helps a team compare seasons and check whether a pattern is real.',
      activity: 'Record the temperature in the same safe place at three different times. Write down the time and instrument too. What would make your readings easier for a classmate to compare?',
      question: 'Why should scientists write down how and when a measurement was taken?', search: 'meteorological',
      sources: [
        { title: 'Collecting data in Antarctica', organization: 'Science Learning Hub – Pokapū Akoranga Pūtaiao, University of Waikato', url: 'https://www.sciencelearn.org.nz/resources/collecting-data-in-antarctica' },
        { title: 'Collect Antarctic data', organization: 'Discovering Antarctica · Royal Geographical Society (with IBG)', url: 'https://discoveringantarctica.org.uk/science-and-exploration/collect-data/' },
      ],
    },
    {
      id: 'ice-sheets', title: 'Ice on land and ice at sea', tag: 'GLACIERS', minutes: '5 min',
      summary: 'A glacier is ice on land that slowly flows. A huge ice sheet is made from many layers of compacted snow. Floating sea ice is different. When land ice flows into the ocean and melts, it adds water to the sea.',
      activity: 'Sort these into “land” or “floating”: a glacier, an ice sheet, a sea-ice floe and an iceberg. Explain which one began on land.',
      question: 'What extra measurements would help scientists tell whether a glacier is changing?', search: 'ice sheet',
      sources: [
        { title: 'Ice sheets and glaciation', organization: 'Discovering Antarctica · Royal Geographical Society (with IBG)', url: 'https://discoveringantarctica.org.uk/oceans-atmosphere-landscape/ice-land-and-sea/ice-sheets-and-glaciation/' },
        { title: 'Climate change, melting ice and sea level rise', organization: 'Science Learning Hub – Pokapū Akoranga Pūtaiao, University of Waikato', url: 'https://www.sciencelearn.org.nz/resources/2277-climate-change-melting-ice-and-sea-level-rise' },
      ],
    },
    {
      id: 'polar-climate', title: 'Why study the polar climate?', tag: 'CLIMATE', minutes: '4 min',
      summary: 'The poles are far away, but air, ocean and ice are part of Earth’s connected climate system. Scientists compare observations over time so they can investigate what is changing and what might happen next.',
      activity: 'Draw arrows between sunlight, snow, ocean and air. Label one measurement that could help test each connection.',
      question: 'Which is stronger evidence: one unusual day, or measurements collected in the same way over many years? Why?', search: 'climate',
      sources: [
        { title: 'A changing climate', organization: 'Discovering Antarctica · Royal Geographical Society (with IBG)', url: 'https://discoveringantarctica.org.uk/oceans-atmosphere-landscape/a-changing-climate/' },
        { title: 'Antarctica and global climate change', organization: 'Science Learning Hub – Pokapū Akoranga Pūtaiao, University of Waikato', url: 'https://www.sciencelearn.org.nz/resources/antarctica-and-global-climate-change' },
      ],
    },
  ],
  hi: [
    {
      id: 'ice-cores', title: 'बर्फ़ के कोर: पृथ्वी की समय-कैप्सूल', tag: 'बर्फ़ और जलवायु', minutes: '5 मिनट',
      summary: 'बर्फ़ कई परतों में जमती है। बर्फ़ बनते समय हवा के छोटे बुलबुले और धूल उसमें बंद हो सकते हैं। वैज्ञानिक इन संकेतों से समझते हैं कि बहुत पहले हवा और जलवायु कैसे बदली थी।',
      activity: 'दस “बर्फ़ीले वर्षों” की परतें बनाइए। हर परत में वैज्ञानिक द्वारा मापे जा सकने वाला एक संकेत लिखें; देखे गए तथ्य और अनुमान अलग-अलग चिह्नित करें।',
      question: 'पुरानी और नई बर्फ़ की परतों की तुलना करना उपयोगी क्यों है?', search: 'ice core',
      sources: [
        { title: 'Captured in ice', organization: 'Science Learning Hub – Pokapū Akoranga Pūtaiao, University of Waikato', url: 'https://www.sciencelearn.org.nz/resources/2712-captured-in-ice' },
        { title: 'The climate of the past', organization: 'Discovering Antarctica · Royal Geographical Society (with IBG)', url: 'https://discoveringantarctica.org.uk/oceans-atmosphere-landscape/a-changing-climate/the-climate-of-the-past/' },
      ],
    },
    {
      id: 'food-webs', title: 'एक छोटे जीव से बड़ा खाद्य-जाल', tag: 'समुद्री जीवन', minutes: '4 मिनट',
      summary: 'फाइटोप्लैंकटन नाम के बहुत छोटे पौधे सूरज की रोशनी का उपयोग करते हैं। क्रिल जैसे छोटे जीव उन्हें खाते हैं; मछलियाँ, पेंगुइन, सील और व्हेल खाद्य-जाल की अगली कड़ियों पर निर्भर हो सकते हैं।',
      activity: 'भोजन से खाने वाले जीव की ओर तीर बनाकर खाद्य-जाल बनाइए। उसमें क्रिल, पेंगुइन और व्हेल जोड़ें। इसे पूरा करने के लिए आपको कौन-सा प्रमाण चाहिए?',
      question: 'अगर भोजन का कोई स्रोत मिलना कठिन हो जाए, तो सबसे पहले किन जीवों पर असर पड़ सकता है?', search: 'krill',
      sources: [
        { title: 'Antarctic life and ecosystems', organization: 'Science Learning Hub – Pokapū Akoranga Pūtaiao, University of Waikato', url: 'https://www.sciencelearn.org.nz/resources/antarctic-life-and-ecosystems' },
        { title: 'Ecosystems and foodwebs', organization: 'Discovering Antarctica · Royal Geographical Society (with IBG)', url: 'https://discoveringantarctica.org.uk/ecosystems-and-foodwebs/' },
      ],
    },
    {
      id: 'field-science', title: 'वैज्ञानिक संकेत कैसे जुटाते हैं?', tag: 'मैदानी विज्ञान', minutes: '4 मिनट',
      summary: 'वैज्ञानिक नोटबुक, थर्मामीटर, मौसम केंद्र या डेटा लॉगर का उपयोग कर सकते हैं। सावधानी से बार-बार माप लेने से टीम अलग-अलग मौसमों की तुलना कर सकती है।',
      activity: 'एक सुरक्षित जगह का तापमान तीन अलग-अलग समय पर मापें। समय और उपकरण भी लिखें। आपकी रीडिंग की तुलना करना सहपाठी के लिए कैसे आसान होगा?',
      question: 'माप कब और कैसे लिया गया, यह लिखना क्यों ज़रूरी है?', search: 'meteorological',
      sources: [
        { title: 'Collecting data in Antarctica', organization: 'Science Learning Hub – Pokapū Akoranga Pūtaiao, University of Waikato', url: 'https://www.sciencelearn.org.nz/resources/collecting-data-in-antarctica' },
        { title: 'Collect Antarctic data', organization: 'Discovering Antarctica · Royal Geographical Society (with IBG)', url: 'https://discoveringantarctica.org.uk/science-and-exploration/collect-data/' },
      ],
    },
    {
      id: 'ice-sheets', title: 'ज़मीन की बर्फ़ और समुद्र की बर्फ़', tag: 'हिमनद', minutes: '5 मिनट',
      summary: 'हिमनद ज़मीन पर मौजूद बर्फ़ है जो धीरे-धीरे बहती है। विशाल हिम-चादरें जमी हुई बर्फ़ की कई परतों से बनती हैं। तैरती समुद्री बर्फ़ अलग होती है। ज़मीन की बर्फ़ समुद्र तक बहकर पिघले तो समुद्र में पानी बढ़ता है।',
      activity: 'इनको “ज़मीन” या “तैरती” श्रेणी में रखें: हिमनद, हिम-चादर, समुद्री बर्फ़ और हिमखंड। बताइए कौन-सी बर्फ़ ज़मीन से आई।',
      question: 'हिमनद में बदलाव जानने के लिए वैज्ञानिक कौन-से और माप ले सकते हैं?', search: 'ice sheet',
      sources: [
        { title: 'Ice sheets and glaciation', organization: 'Discovering Antarctica · Royal Geographical Society (with IBG)', url: 'https://discoveringantarctica.org.uk/oceans-atmosphere-landscape/ice-land-and-sea/ice-sheets-and-glaciation/' },
        { title: 'Climate change, melting ice and sea level rise', organization: 'Science Learning Hub – Pokapū Akoranga Pūtaiao, University of Waikato', url: 'https://www.sciencelearn.org.nz/resources/2277-climate-change-melting-ice-and-sea-level-rise' },
      ],
    },
    {
      id: 'polar-climate', title: 'ध्रुवीय जलवायु का अध्ययन क्यों?', tag: 'जलवायु', minutes: '4 मिनट',
      summary: 'ध्रुव हमसे बहुत दूर हैं, फिर भी हवा, समुद्र और बर्फ़ पृथ्वी की जुड़ी हुई जलवायु-प्रणाली का हिस्सा हैं। वैज्ञानिक समय के साथ मापों की तुलना करके बदलाव की जाँच करते हैं।',
      activity: 'धूप, बर्फ़, समुद्र और हवा के बीच तीर बनाइए। हर संबंध की जाँच के लिए एक माप लिखें।',
      question: 'कौन-सा प्रमाण बेहतर है: एक असामान्य दिन या कई वर्षों तक एक ही तरीके से लिए गए माप? क्यों?', search: 'climate',
      sources: [
        { title: 'A changing climate', organization: 'Discovering Antarctica · Royal Geographical Society (with IBG)', url: 'https://discoveringantarctica.org.uk/oceans-atmosphere-landscape/a-changing-climate/' },
        { title: 'Antarctica and global climate change', organization: 'Science Learning Hub – Pokapū Akoranga Pūtaiao, University of Waikato', url: 'https://www.sciencelearn.org.nz/resources/antarctica-and-global-climate-change' },
      ],
    },
  ],
};
