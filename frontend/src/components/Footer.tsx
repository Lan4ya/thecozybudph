const Footer = () => {
  return (
    <footer className="mt-auto bg-secondary text-secondary-foreground py-8">
      <div className="custom-container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h4 className="font-back-to-black text-primary-foreground text-20-bold">
            The Cozy Bud
          </h4>
          <p className="text-12-normal mt-2">Handmade florals • PH</p>
        </div>

        <div className="text-12-normal">
          <p>
            © {new Date().getFullYear()} The Cozy Bud — All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
