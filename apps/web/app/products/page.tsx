import { ProductsPage } from "../../src/App";
import { pageMetadata } from "../_metadata";

export const metadata = pageMetadata({
  title: "Products for AI agents",
  description: "Discover products through the complete outcomes AI agents can make with them.",
  path: "/products",
});

export default function ProductsDirectoryPage() {
  return <ProductsPage />;
}
