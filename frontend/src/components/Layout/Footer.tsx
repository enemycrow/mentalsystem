import BrandBanner from '../Promotion/BrandBanner';

export default function Footer() {
  return (
    <footer className="footer">
      <BrandBanner />
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MentalSystem. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
