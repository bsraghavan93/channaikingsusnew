// ─── CHENNAI KINGS MENU DATA ───
// Edit prices, names, descriptions, or add/remove items here.
// Each category has: id, label, and sections[].
// Each section has: title, cols (1/2/3), optional note, and items[].

const MENU_DATA = [
  {
    id: 'soups',
    label: 'Soups',
    sections: [
      {
        title: 'Soups · 8 oz',
        cols: 1,
        items: [
          { name: 'Navrattan Aattukal Soup',  desc: 'A flavorful Mutton leg soup blended with Navrattan Spices (9 different types of spices / Mutton - Matured sheep)', price: '$8.99' },
          { name: 'Sweet Corn Veg Soup',       desc: 'A Sumptuous soup with crushed and whole sweet corn and colourful assortment of juicy vegetables', price: '$6.99' },
          { name: 'Tomato Soup',               desc: 'A creamy soup delight with the rich taste of fresh plum tomatoes and a dash of cream added as topping', price: '$6.99' },
          { name: 'Kothamalli Rasam',          desc: 'A Traditional, mildly spiced lentil extract flavored with Coriander', price: '$6.99' },
          { name: 'Chicken Soup',              desc: 'A bold, flavorful broth made with tender chicken, crushed pepper, and warming spices', price: '$7.99' },
          { name: 'Crab Rasam',                desc: 'A traditional South Indian soup with the tangy and spicy notes of rasam combined with the rich flavor of crab', price: '$9.99' },
        ]
      }
    ]
  },

  {
    id: 'veg-apps',
    label: 'Veg Appetizers',
    sections: [
      {
        title: 'Appetizers · Vegetarian',
        cols: 2,
        items: [
          { name: 'Sesame Gobi Manchurian',        desc: 'Cauliflower fritters in Manchurian sauce', price: '$18.99' },
          { name: 'Chilli Paneer',                  desc: 'Paneer & bell pepper stir fried in tangy chilli sauce', price: '$18.99' },
          { name: 'Mushroom Pepper Fry',            desc: 'Classic Indo-Chinese spicy mushroom', price: '$18.99' },
          { name: 'Chilli Baby Corn',               desc: 'Spicy indo-chinese baby corn', price: '$18.99' },
          { name: 'Veg Samosa (4 pcs)',             desc: 'Flaky and crunchy fried Samosa', price: '$14.99' },
          { name: 'Assorted Bajji',                 desc: 'Spicy aaloo, onion, chilli fritters, garnished with cilantro', price: '$15.99' },
          { name: 'Panner Pakoda',                  desc: 'Spicy paneer fritters garnished with cilantro', price: '$16.99' },
          { name: 'Marina Beach Milagai Bajji',     desc: 'Indian green chilli seasoned in chickpeas batter, fried, garnished with cilantro', price: '$15.99' },
          { name: 'Onion Pakora',                   desc: 'Onion and chickpeas flour fritters', price: '$15.99' },
        ]
      }
    ]
  },

  {
    id: 'nonveg-apps',
    label: 'Non-Veg Appetizers',
    sections: [
      {
        title: 'Appetizers · Non-Vegetarian',
        cols: 2,
        items: [
          { name: 'Pepper Goat Sukka Varuval',  desc: 'Grilled Goat with Onion Masala & Pepper', price: '$21.99' },
          { name: 'Buhari Chicken 65',           desc: 'Fried Chicken, Marinated in 65 Spices', price: '$19.99' },
          { name: 'Chilli Chicken',              desc: 'Chicken Fritters Tossed in Chilli Sauce', price: '$19.99' },
          { name: 'Garlic Chicken',              desc: 'Juicy chicken pieces cooked with roasted garlic, ginger, and a blend of Indian spices', price: '$19.99' },
          { name: 'Grilled Mustard Shrimps',     desc: 'Shrimps marinated with mustard oil, spices and grilled', price: '$21.99' },
          { name: 'Ginger Chilli Prawns',        desc: 'Prawns Sauteed in Ginger Chilli Sauce', price: '$21.99' },
          { name: 'Grilled Fish (3 Pcs)',         desc: 'Marinated & Grilled Fish', price: '$19.99' },
          { name: 'Whole Fish Fry',              desc: 'Marinated & Deep Fried Fish', price: '$29.99' },
        ]
      }
    ]
  },

  {
    id: 'idly',
    label: 'Idly & Vadas',
    sections: [
      {
        title: 'Idly & Vadas',
        cols: 1,
        items: [
          { name: 'Idly Vada Combo',                        desc: '2 Piece each with chutney and sambar', price: '$14.99' },
          { name: 'Medhu Vada (2 Pcs)',                     desc: 'Served with Sambar & Chutney', price: '$9.99' },
          { name: 'Idly with Sambar & Chutney (4 Pcs)',     desc: 'Traditional Steamed lentil & rice cake served with Sambar & Chutney', price: '$14.99' },
        ]
      }
    ]
  },

  {
    id: 'uthappam',
    label: 'Uthappam',
    sections: [
      {
        title: 'Uthappam',
        cols: 1,
        items: [
          { name: 'Mix Veg Uthapam',    desc: 'Rice and lentil crepe stuffed with mixed vegetables', price: '$16.99' },
          { name: 'Tomato Uthapam',     desc: 'Rice and lentil crepe stuffed with Tomato', price: '$16.99' },
          { name: 'Onion Uthapam',      desc: 'Rice and lentil crepe stuffed with Onion', price: '$16.99' },
        ]
      }
    ]
  },

  {
    id: 'dosas',
    label: 'Dosas',
    sections: [
      {
        title: 'Dosas',
        cols: 1,
        items: [
          { name: 'Plain Dosa',               desc: 'Crispy crepe made with rice and lentil', price: '$15.99' },
          { name: 'Mysore Masala Dosa',        desc: 'A crisp, golden dosa generously spread with spicy red chutney and filled with flavorful potato masala. Served with sambar and chutneys', price: '$16.99' },
          { name: 'Madras Masala Dosa',        desc: 'Rice and lentil crepe stuffed with spicy potato masala', price: '$16.99' },
          { name: 'Ghee Cone Dosa',            desc: 'Fermented rice and lentil crepe in a cone shape, topped with ghee', price: '$16.99' },
          { name: 'Spring Dosa',               desc: 'Fermented rice and lentil crepe with farmers market organic vegetables', price: '$16.99' },
          { name: 'Kal Dosa',                  desc: 'Fermented lentil & rice pancake served with sambar and coconut chutney', price: '$16.99' },
          { name: 'Paneer Dosa',               desc: 'Fermented rice and lentil crepe with cottage cheese and spices', price: '$16.99' },
          { name: "Parry's Corner Onion Dosa", desc: "Thin fermented rice & lentil crepe topped with onions — inspired by the famous Parry's Corner in Chennai", price: '$16.99' },
          { name: 'Egg Pepper Dosa',           desc: 'Plain dosa spreaded with beated egg with onions & chiles', price: '$16.99' },
          { name: 'Masala Mushroom Dosa',      desc: 'Rice and lentil stuffed with spicy mushroom masala', price: '$16.99' },
          { name: 'Madurai Mutton Kari Dosa',  desc: 'Crispy dosa topped with spicy Madurai-style mutton keema, slow-cooked with aromatic spices', price: '$19.99' },
        ]
      }
    ]
  },

  {
    id: 'biryani',
    label: 'Biryani',
    sections: [
      {
        title: 'Biryani',
        cols: 2,
        items: [
          { name: 'Vegetable Biryani',  desc: 'Seasonal vegetables cooked with rice in Chennai Style', price: '$18.99' },
          { name: 'Egg Biryani',        desc: 'Chennai Style egg cooked with basmati rice', price: '$18.99' },
          { name: 'Chicken Biryani',    desc: 'Biryani cooked with bone in chicken', price: '$19.99' },
          { name: 'Goat Biryani',       desc: 'Tamil style biryani with goat (bone-in) and spices', price: '$20.99' },
          { name: 'Prawn Biryani',      desc: 'Spicy Shrimp biryani cooked in chennai style', price: '$20.99' },
        ]
      }
    ]
  },

  {
    id: 'veg-curry',
    label: 'Veg Curry',
    sections: [
      {
        title: 'Veg Curry',
        cols: 1,
        items: [
          { name: 'Spinach Dhal',         desc: 'A comforting dish of yellow split peas and spinach flavored with butter infused with cumin, turmeric, garlic ginge and serrano chile', price: '$18.99' },
          { name: 'Tomato Dhal',          desc: 'A simple and comforting stew made with lentils cooked in tomatoes', price: '$18.99' },
          { name: 'Vegetable Kurma',      desc: 'Mixed vegetables cooked in a coconut based gravy', price: '$18.99' },
          { name: 'Kadai Vegetable',      desc: 'Vegetables stir fried with ginger, onions, bell peppers, tomatoes, & spices in a wok', price: '$19.99' },
          { name: 'Paneer Butter Masala', desc: 'A rich and creamy panner cooked in buttery silky tomato sauce', price: '$19.99' },
          { name: 'Spinach Panner Curry', desc: 'A Classic Indian dish of cooked spinach studded with cubes of fried panner cheese', price: '$19.99' },
        ]
      }
    ]
  },

  {
    id: 'chicken-curry',
    label: 'Chicken Curry',
    sections: [
      {
        title: 'Chicken Curry',
        cols: 1,
        items: [
          { name: 'Chettinad Chicken Curry',  desc: 'A traditional South Indian chicken curry bursting with bold flavors of roasted spices, black pepper, fennel, and coconut. Rich, aromatic, and fiery.', price: '$20.99' },
          { name: 'Kadai Chicken',            desc: 'Boneless chicken pieces stir fried with ginger, onions, bell peppers, tomatoes, & spices in a wok', price: '$20.99' },
          { name: 'Gongura Chicken Curry',    desc: 'A popular Andhra Chicken curry cooked with gongura (Red Sorrel) leaves', price: '$20.99' },
          { name: 'Butter Chicken',           desc: 'Tandoor Chicken Cooked in rich, Creamy, Tomato Onion sauce', price: '$20.99' },
        ]
      }
    ]
  },

  {
    id: 'mutton',
    label: 'Mutton/Goat',
    sections: [
      {
        title: 'Mutton / Goat Curry',
        cols: 1,
        items: [
          { name: 'Madras Mutton / Goat Curry',   desc: 'Special Goat Curry cooked in a slow fire, with fresh spices & onion sauce', price: '$21.99' },
          { name: 'Mutton / Goat Kurma',          desc: 'A rich and creamy lamb curry delicately flavoured with spices', price: '$21.99' },
          { name: 'Gongura Mutton / Goat Curry',  desc: 'Andhra style spicy goat curry cooked with gongura (Red Sorrel) leaves', price: '$21.99' },
        ]
      }
    ]
  },

  {
    id: 'seafood',
    label: 'Seafood',
    sections: [
      {
        title: 'Sea Food Special',
        cols: 1,
        items: [
          { name: 'Chennai Fish Curry',       desc: 'Cubed fish sautéed with shallots, coriander, tamarind & spices', price: '$20.99' },
          { name: 'Kerala Fish Curry',        desc: 'Traditional Kerala hot and spicy fish curry with coconut milk', price: '$20.99' },
          { name: 'Chettinad Shrimp Curry',   desc: 'Tender Shrimp marinated with Chettinad spices cooked with curry leaves', price: '$21.99' },
          { name: 'Kerala Prawn Curry',       desc: 'Marinated Prawns in coconut milk gravy, sauteed with onions, tomatoes and other Indian spices', price: '$21.99' },
          { name: 'Crab Masala (Half Crab)',  desc: 'A Spicy crab curry cooked with hot Indian Spices, sliced red onion', price: 'Market Price' },
          { name: 'Crab Masala (Whole Crab)', desc: 'A Spicy crab curry cooked with hot Indian Spices, sliced red onion', price: 'Market Price' },
        ]
      }
    ]
  },

  {
    id: 'kothu',
    label: 'Kothu Parotta',
    sections: [
      {
        title: 'Kothu Parotta',
        note: 'A Popular Delicacy from Tamilnadu — Minced Parotta with Choice of Protein & Veggies',
        cols: 2,
        items: [
          { name: 'Veg Kothu Parotta',     desc: 'Minced parotta sauted with onions, veg gravy and masala', price: '$18.99' },
          { name: 'Egg Kothu Parotta',     desc: 'Minced parotta sauted with onions and masala', price: '$19.99' },
          { name: 'Chicken Kothu Parotta', desc: 'Minced parotta sauted with onions, chicken gravy and masala', price: '$19.99' },
          { name: 'Mutton Kothu Parotta',  desc: 'Minced parotta sauted with onions, mutton gravy and masala', price: '$21.99' },
        ]
      }
    ]
  },

  {
    id: 'breads',
    label: 'Breads & Sides',
    sections: [
      {
        title: 'Indian Breads',
        cols: 2,
        items: [
          { name: 'Poori Masala (3 Pcs)',    desc: 'Crispy Puffed Bread with Potato Masala', price: '$15.99' },
          { name: 'Poori Channa (3 Pcs)',    desc: 'Crispy Puffed Bread with Chana Masala', price: '$15.99' },
          { name: 'Chapati (2 Pcs)',         desc: 'Indian Thin Whole Wheat Flat Bread', price: '$6.99' },
          { name: 'Plain/Butter Naan (2 Pcs)', desc: 'Indian Fluffy Flat Bread', price: '$6.99' },
          { name: 'Garlic Naan (2 Pcs)',     desc: 'Indian Fluffy Flat Bread with Garlic', price: '$6.99' },
          { name: 'Parotta (2 Pcs)',         desc: 'Thick & Flaky Layered Flat Bread', price: '$6.99' },
          { name: 'Poori (2 Pcs)',           desc: 'Crispy Puffed Bread', price: '$6.99' },
        ]
      },
      {
        title: 'Sides',
        cols: 2,
        items: [
          { name: 'Basmati Rice 16 Oz',   desc: '', price: '$6.99' },
          { name: 'Madras Paapad (4 Pcs)', desc: '', price: '$6.99' },
          { name: 'Yogurt / Raita',        desc: '', price: '$6.99' },
          { name: 'Sambar 8 Oz',           desc: '', price: '$6.99' },
          { name: 'Potato Masala',         desc: '', price: '$6.99' },
        ]
      },
      {
        title: 'Desserts',
        cols: 2,
        items: [
          { name: 'Gulab Jamun',  desc: '', price: '$6.99' },
          { name: 'Rasamalai',    desc: '', price: '$6.99' },
        ]
      }
    ]
  },

  {
    id: 'drinks',
    label: 'Beverages',
    sections: [
      {
        title: 'Beverages',
        cols: 2,
        items: [
          { name: 'Mango Lassi',   desc: '', price: '$5.99' },
          { name: 'Buttermilk',    desc: '', price: '$4.99' },
          { name: 'Rosemilk',      desc: '', price: '$4.99' },
          { name: 'Soft Drinks',   desc: '', price: 'Ask for Price' },
          { name: 'Filter Coffee', desc: '', price: '$3.99' },
          { name: 'Masala Tea',    desc: '', price: '$3.99' },
        ]
      },
      {
        title: 'Beers',
        cols: 3,
        items: [
          { name: 'Corona / Heineken / Blue Moon',  desc: '', price: '$7.99' },
          { name: 'Taj Mahal Indian Beer (Small)',   desc: '', price: '$8.99' },
          { name: 'Taj Mahal Indian Beer (Large)',   desc: '', price: '$14.99' },
        ]
      },
      {
        title: 'Wines',
        cols: 2,
        items: [
          { name: 'Red Wine (Glass)',   desc: 'Merlot | Pinot-Noir | Caberbet', price: '$15.99' },
          { name: 'White Wine (Glass)', desc: 'Bottle Price $59.99 — ask for brand description', price: '$15.99' },
        ]
      }
    ]
  }
];
