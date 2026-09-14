const sponsors = document.querySelector('.splash__sponsors');
const layoutSelect = document.querySelector('[data-sponsor-layout-select]');

const layouts = [
    {
        id: 'lg-1-md-1',
        groups: [
            { size: 'lg', count: 1 },
            { size: 'md', count: 1 },
        ],
    },
    {
        id: 'lg-1-md-2',
        groups: [
            { size: 'lg', count: 1 },
            { size: 'md', count: 2 },
        ],
    },
    {
        id: 'lg-2',
        groups: [
            { size: 'lg', count: 2 },
        ],
    },
    {
        id: 'lg-3',
        groups: [
            { size: 'lg', count: 3 },
        ],
    },
];

if (sponsors && layoutSelect) {
    const createGroup = ({ size, count }) => {
        const list = document.createElement('ul');
        list.className = `sponsor__logos sponsor__logos--${size}`;
        list.hidden = size === 'md';

        for (let index = 0; index < count; index += 1) {
            const item = document.createElement('li');
            item.className = `sponsor__logo sponsor__logo--${size}`;

            if (size === 'lg') {
                const image = document.createElement('img');
                item.classList.add('sponsor__logo--has-image');
                image.src = 'images/sponsors-logo.webp';
                image.width = 517;
                image.height = 241;
                image.alt = 'ผู้สนับสนุน BetterTrade 2026';
                item.append(image);
            }

            list.append(item);
        }

        return list;
    };

    const renderLayout = (layoutId) => {
        const layout = layouts.find(({ id }) => id === layoutId) ?? layouts[0];
        sponsors.dataset.sponsorLayout = layout.id;
        sponsors.replaceChildren(...layout.groups.map(createGroup));
        window.dispatchEvent(new Event('resize'));
    };

    layoutSelect.addEventListener('change', () => {
        renderLayout(layoutSelect.value);
    });
}
