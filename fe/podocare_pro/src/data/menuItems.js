const menuItems = [
    {
        name: "Magazyn", 
        href: '/'
    },
    {
        name: "Zamówienia", 
        href: '/zamowienia'
    },
    {
        name: "Utarg", 
        href: '/mail'
    },
    {
        name: "Klienci", 
        href: '/complain'
    },
    {
        name: "Grafik", 
        href: '/employee'
    },
    {
        name: "Ustawienia", 
        href: '/ustawienia'
    },
];

menuItems.forEach(item => {
    item.src = `src/assets/${item.name.toLowerCase()}_icon.svg`; 
    item.alt = `${item.name.toLowerCase()}-icon`; 
});

export default menuItems;