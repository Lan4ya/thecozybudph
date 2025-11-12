import { Button } from "@/lib/ui/__shadcn__/button";
import { Link } from "react-router";
// const admin_route_hash = import.meta.env.VITE_ADMIN_ROUTE_HASH!;

const Footer = () => {
  return (
    <footer className="mt-auto bg-secondary text-secondary-foreground py-8">
      {/* <Button asChild className="fixed bottom-5"> */}
      {/*   <Link to={`/admin-${admin_route_hash}/login`}> */}
      {/*     Admin Dashboard (DEV) */}
      {/*   </Link> */}
      {/* </Button> */}

      <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
