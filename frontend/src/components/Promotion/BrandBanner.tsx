const brands = [
  {
    name: 'MentalSystem',
    description: 'Disena sistemas para lograr tus objetivos',
    url: '#',
    emoji: '\u{1F9E0}',
  },
  {
    name: 'RodColeman',
    description: 'Desarrollo web y tecnologia',
    url: 'https://rodcoleman.dev',
    emoji: '\u{1F4BB}',
  },
  {
    name: 'SystemThinking',
    description: 'Aprende a pensar en sistemas',
    url: '#',
    emoji: '\u{1F50D}',
  },
  {
    name: 'HabitForge',
    description: 'Forja habitos que perduran',
    url: '#',
    emoji: '\u{1F525}',
  },
];

export default function BrandBanner() {
  return (
    <div className="brand-banner">
      <div className="brand-banner-scroll">
        {brands.map((brand, i) => (
          <a
            key={i}
            href={brand.url}
            className="brand-card"
            target={brand.url.startsWith('http') ? '_blank' : undefined}
            rel={
              brand.url.startsWith('http')
                ? 'noopener noreferrer'
                : undefined
            }
          >
            <span className="brand-emoji">{brand.emoji}</span>
            <span className="brand-name">{brand.name}</span>
            <span className="brand-desc">{brand.description}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
