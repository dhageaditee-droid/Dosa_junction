import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    menu: 'Menu',
    offers: 'Offers',
    about: 'About',
    contact: 'Contact',
    myOrders: 'My Orders',
    cart: 'Cart',
    admin: 'Admin',

    // Hero & Taglines
    tagline: 'South Indian Flavours',
    subTagline: 'Taste of South',
    exploreMenu: 'Explore Menu & Order Now',

    // Menu Page
    ourMenu: 'Our South Indian Menu',
    menuDesc: 'Explore authentic crisp dosas, ghee specials, uttapam, soft idli, pineapple sheera, and filter coffee.',
    categories: 'CATEGORIES',
    searchPlaceholder: 'Search dishes by name...',
    noDishes: 'No dishes found',
    noDishesDesc: 'No dishes available in this category.',
    viewAllDishes: 'View All Dishes',

    // Categories
    cat_all: 'All Dishes',
    cat_beverages: 'Tea & Beverages',
    cat_dosa: 'Dosa',
    cat_special_dosa: 'Special Dosa',
    cat_uttapam: 'Uttapam',
    cat_idli: 'Idli',
    cat_vada: 'Vada',
    cat_desserts: 'Sheera & Desserts',
    cat_rice: 'Rice',
    cat_extras: 'Extras',

    // Food Card & Cart Actions
    add: 'ADD',
    added: 'ADDED',
    item: 'Item',
    items: 'Items',
    confirm: 'Confirm',
    proceedToOrder: 'Proceed to Order',
    viewCart: 'View Cart',
    clearCart: 'Clear Cart',
    total: 'Total',
    price: 'Price',
    mins: 'mins',

    // Common Dish Names Translation Dictionary
    dish_Chaha: 'Chaha',
    dish_Coffee: 'Coffee',
    dish_MasalaDosa: 'Masala Dosa',
    dish_MysoreMasalaDosa: 'Mysore Masala Dosa',
    dish_ButterPodiMasalaDosa: 'Butter Podi Masala Dosa',
    dish_SpecialDosa: 'Special Dosa',
    dish_GheeNammaSouthSpecialDosa: 'Ghee Namma South Special Dosa',
    dish_GheePodiMasalaDosa: 'Ghee Podi Masala Dosa',
    dish_LoniSpongeDosa: 'Loni Sponge Dosa',
    dish_IdliSambar: 'Idli Sambar',
    dish_MeduVada: 'Medu Vada',
    dish_PineappleSheera: 'Pineapple Sheera',

    // Footer & Contact
    footerDesc: 'Authentic South Indian restaurant serving crispy dosas, ghee podi specials, uttapam, fluffy idli, and degree filter coffee.',
    callUs: 'Call Us',
    whatsappUs: 'WhatsApp',
    rights: 'All rights reserved.'
  },

  mr: {
    // Navigation
    home: 'मुख्यपृष्ठ',
    menu: 'मेनू',
    offers: 'ऑफर्स',
    about: 'आमच्याबद्दल',
    contact: 'संपर्क',
    myOrders: 'माझे ऑर्डर्स',
    cart: 'कार्ट',
    admin: 'ॲडमिन',

    // Hero & Taglines
    tagline: 'दक्षिण भारतीय अस्सल चव',
    subTagline: 'साऊथ इंडियन फ्लेव्हर्स',
    exploreMenu: 'मेनू पहा आणि ऑर्डर करा',

    // Menu Page
    ourMenu: 'आमचा दक्षिण भारतीय मेनू',
    menuDesc: 'अस्सल कुरकुरीत डोसे, तूप स्पेशल, उत्तपम, मऊ इडली, अननस शिरा आणि फिल्टर कॉफीचा आस्वाद घ्या.',
    categories: 'वर्गवारी (कॅटेगिरी)',
    searchPlaceholder: 'पदार्थ शोधा...',
    noDishes: 'कोणतेही पदार्थ आढळले नाहीत',
    noDishesDesc: 'या प्रकारात कोणतेही पदार्थ उपलब्ध नाहीत.',
    viewAllDishes: 'सर्व पदार्थ पहा',

    // Categories
    cat_all: 'सर्व पदार्थ',
    cat_beverages: 'चहा आणि पेये',
    cat_dosa: 'डोसा',
    cat_special_dosa: 'स्पेशल डोसा',
    cat_uttapam: 'उत्तपम',
    cat_idli: 'इडली',
    cat_vada: 'वडा',
    cat_desserts: 'शिरा आणि गोड पदार्थ',
    cat_rice: 'भात (राईस)',
    cat_extras: 'अतिरिक्त (एक्स्ट्रा)',

    // Food Card & Cart Actions
    add: 'जोडा',
    added: 'जोडले',
    item: 'पदार्थ',
    items: 'पदार्थ',
    confirm: 'कंफर्म करा',
    proceedToOrder: 'ऑर्डर पूर्ण करा',
    viewCart: 'कार्ट पहा',
    clearCart: 'कार्ट रिकामी करा',
    total: 'एकूण',
    price: 'किंमत',
    mins: 'मिनिटे',

    // Common Dish Names Translation Dictionary
    dish_Chaha: 'चहा',
    dish_Coffee: 'कॉफी',
    dish_MasalaDosa: 'मसाला डोसा',
    dish_MysoreMasalaDosa: 'म्हैसूर मसाला डोसा',
    dish_ButterPodiMasalaDosa: 'बटर पोडी मसाला डोसा',
    dish_SpecialDosa: 'स्पेशल डोसा',
    dish_GheeNammaSouthSpecialDosa: 'तूप नम्मा साऊथ स्पेशल डोसा',
    dish_GheePodiMasalaDosa: 'तूप पोडी मसाला डोसा',
    dish_LoniSpongeDosa: 'लोणी स्पंज डोसा 2 नग',
    dish_IdliSambar: 'इडली सांबार',
    dish_MeduVada: 'मेदू वडा',
    dish_PineappleSheera: 'अननस शिरा',

    // Footer & Contact
    footerDesc: 'अस्सल दक्षिण भारतीय रेस्टॉरंट - जिथे मिळतात कुरकुरीत डोसे, तूप पोडी स्पेशल, उत्तपम, मऊ इडली आणि फिल्टर कॉफी.',
    callUs: 'कॉल करा',
    whatsappUs: 'व्हॉट्सॲप',
    rights: 'सर्व हक्क राखीव.'
  },

  hi: {
    // Navigation
    home: 'होम',
    menu: 'मेनू',
    offers: 'ऑफ़र्स',
    about: 'हमारे बारे में',
    contact: 'संपर्क',
    myOrders: 'मेरे ऑर्डर्स',
    cart: 'कार्ट',
    admin: 'एडमिन',

    // Hero & Taglines
    tagline: 'साउथ इंडियन जायका',
    subTagline: 'दक्षिण भारत का असली स्वाद',
    exploreMenu: 'मेनू देखें और ऑर्डर करें',

    // Menu Page
    ourMenu: 'हमारा दक्षिण भारतीय मेनू',
    menuDesc: 'प्रामाणिक खस्ता डोसा, घी स्पेशल, उत्तपम, सॉफ्ट इडली, अनानास शीरा और फ़िल्टर कॉफ़ी का आनंद लें।',
    categories: 'श्रेणियां (कैटेगरी)',
    searchPlaceholder: 'व्यंजन खोजें...',
    noDishes: 'कोई व्यंजन नहीं मिला',
    noDishesDesc: 'इस श्रेणी में कोई व्यंजन उपलब्ध नहीं है।',
    viewAllDishes: 'सभी व्यंजन देखें',

    // Categories
    cat_all: 'सभी व्यंजन',
    cat_beverages: 'चाय और पेय',
    cat_dosa: 'डोसा',
    cat_special_dosa: 'स्पेशल डोसा',
    cat_uttapam: 'उत्तपम',
    cat_idli: 'इडली',
    cat_vada: 'वड़ा',
    cat_desserts: 'शीरा और मिठाई',
    cat_rice: 'चावल (राइस)',
    cat_extras: 'अतिरिक्त (एक्स्ट्रा)',

    // Food Card & Cart Actions
    add: 'जोड़ें',
    added: 'जोड़ा गया',
    item: 'आइटम',
    items: 'आइटम',
    confirm: 'कंफर्म करें',
    proceedToOrder: 'ऑर्डर आगे बढ़ाएं',
    viewCart: 'कार्ट देखें',
    clearCart: 'कार्ट खाली करें',
    total: 'कुल',
    price: 'मूल्य',
    mins: 'मिनट',

    // Common Dish Names Translation Dictionary
    dish_Chaha: 'चाय',
    dish_Coffee: 'कॉफ़ी',
    dish_MasalaDosa: 'मसाला डोसा',
    dish_MysoreMasalaDosa: 'मैसूर मसाला डोसा',
    dish_ButterPodiMasalaDosa: 'बटर पोडी मसाला डोसा',
    dish_SpecialDosa: 'स्पेशल डोसा',
    dish_GheeNammaSouthSpecialDosa: 'घी नम्मा साउथ स्पेशल डोसा',
    dish_GheePodiMasalaDosa: 'घी पोडी मसाला डोसा',
    dish_LoniSpongeDosa: 'लोणी स्पंज डोसा 2 नग',
    dish_IdliSambar: 'इडली सांभर',
    dish_MeduVada: 'मेदू वड़ा',
    dish_PineappleSheera: 'अनानास शीरा',

    // Footer & Contact
    footerDesc: 'प्रामाणिक दक्षिण भारतीय रेस्तरां - जहां मिलते हैं कुरकुरे डोसे, घी पोडी स्पेशल, उत्तपम, सॉफ्ट इडली और फ़िल्टर कॉफ़ी।',
    callUs: 'कॉल करें',
    whatsappUs: 'व्हाट्सएप',
    rights: 'सर्वाधिकार सुरक्षित।'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dosa_lang') || 'en';
  });

  const changeLanguage = (lang) => {
    if (['en', 'mr', 'hi'].includes(lang)) {
      setLanguage(lang);
      localStorage.setItem('dosa_lang', lang);
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const translateDish = (dishName) => {
    if (!dishName) return '';
    // Normalize string to match key
    const cleanKey = 'dish_' + dishName.replace(/[^a-zA-Z]/g, '');
    if (translations[language]?.[cleanKey]) {
      return translations[language][cleanKey];
    }
    return dishName;
  };

  const translateCategory = (catSlugOrName) => {
    if (!catSlugOrName) return catSlugOrName;
    const slug = catSlugOrName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const key = `cat_${slug}`;
    if (translations[language]?.[key]) {
      return translations[language][key];
    }
    return catSlugOrName;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, translateDish, translateCategory }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
