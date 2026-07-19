"use client";

import { useState } from "react";
import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagenation/Pagenation";
import DeleteModal from "@/components/deleteModal/DeleteModal";
import ViewProduct, {
  StatusBadge,
  type ProductSubmission,
} from "./ViewProduct";
import EditProductApproval from "./EditProductApproval";

const initialProducts: ProductSubmission[] = [
  { id: 1, product: "Reserva Especial Toro", retailer: "Casa del Habano NYC", submitted: "Jul 3, 2025", status: "Pending" },
  { id: 2, product: "Gran Corona Edición Limitada", retailer: "The Cigar House", submitted: "Jul 4, 2025", status: "Pending" },
  { id: 3, product: "Vintage 2018 Robusto", retailer: "Premium Leaf Co.", submitted: "Jul 5, 2025", status: "Pending" },
  { id: 4, product: "Habana Reserve Churchill", retailer: "Havana Club Boston", submitted: "Jul 6, 2025", status: "Pending" },
  { id: 5, product: "Exclusivo Perfecto", retailer: "The Smoke Lounge", submitted: "Jul 7, 2025", status: "Under Review" },
  { id: 6, product: "Maduro No. 5", retailer: "Montecristo Room", submitted: "Jul 8, 2025", status: "Pending" },
  { id: 7, product: "Royal Corona", retailer: "Churchill's Fine Cigars", submitted: "Jul 9, 2025", status: "Under Review" },
  { id: 8, product: "Serie V Melanio", retailer: "Casa del Habano NYC", submitted: "Jul 10, 2025", status: "Pending" },
  { id: 9, product: "Signature Toro", retailer: "The Cigar House", submitted: "Jul 11, 2025", status: "Pending" },
  { id: 10, product: "Nicaragua Gran Toro", retailer: "Premium Leaf Co.", submitted: "Jul 12, 2025", status: "Under Review" },
  { id: 11, product: "Classic No. 2", retailer: "Havana Club Boston", submitted: "Jul 13, 2025", status: "Pending" },
  { id: 12, product: "Heritage Robusto", retailer: "The Smoke Lounge", submitted: "Jul 14, 2025", status: "Pending" },
];

export default function ProductApprovalList() {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<ProductSubmission | null>(null);
  const [productToEdit, setProductToEdit] = useState<ProductSubmission | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductSubmission | null>(null);
  const itemsPerPage = 5;

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredProducts = products.filter(
    (product) =>
      product.product.toLowerCase().includes(normalizedSearch) ||
      product.retailer.toLowerCase().includes(normalizedSearch) ||
      product.status.toLowerCase().includes(normalizedSearch),
  );
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const updateStatus = (
    product: ProductSubmission,
    status: ProductSubmission["status"],
  ) => {
    setProducts((current) =>
      current.map((item) => (item.id === product.id ? { ...item, status } : item)),
    );
    setSelectedProduct(null);
  };

  const handleDelete = () => {
    if (!productToDelete) return;

    setProducts((current) => current.filter((item) => item.id !== productToDelete.id));
    const remainingPages = Math.max(1, Math.ceil((filteredProducts.length - 1) / itemsPerPage));
    setCurrentPage((page) => Math.min(page, remainingPages));
    setProductToDelete(null);
  };

  return (
    <div className="flex w-full flex-col gap-5 rounded-2xl">
      <div className="flex w-full items-center justify-between">
        <div className="relative w-full max-w-[360px]">
          <Input
            type="text"
            placeholder="Search products, retailers or status..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full rounded-[8px] border border-[#CBA24A]/30 bg-[#1c120c]/90 pl-10 pr-4 text-xs text-[#F7E4B3] placeholder:text-stone-600 focus:border-[#CBA24A]/80 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-[#F7E4B3]/30">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#705929] bg-[#140d09]/40">
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Product</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Retailer</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Submitted</th>
              <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Status</th>
              <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-[#F7E4B3]/70">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#705929]">
            {paginatedProducts.map((product) => (
              <tr key={product.id} className="h-16 transition-colors hover:bg-[#231710]/30">
                <td className="px-6 py-4 text-xs font-semibold text-[#F7E4B3]">{product.product}</td>
                <td className="px-6 py-4 text-xs text-stone-400">{product.retailer}</td>
                <td className="px-6 py-4 text-xs text-stone-500">{product.submitted}</td>
                <td className="px-6 py-4 text-xs"><StatusBadge status={product.status} /></td>
                <td className="px-6 py-4 text-right text-xs">
                  <div className="inline-flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setProductToEdit(product)}
                      title="Edit Product"
                      aria-label={`Edit ${product.product}`}
                      className="cursor-pointer p-1 text-stone-400 transition-colors hover:text-[#CCA352]"
                    >
                      <Pencil className="h-[18px] w-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      title="View Product"
                      aria-label={`View ${product.product}`}
                      className="cursor-pointer p-1 text-stone-400 transition-colors hover:text-[#CCA352]"
                    >
                      <Eye className="h-[18px] w-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductToDelete(product)}
                      title="Delete Product"
                      aria-label={`Delete ${product.product}`}
                      className="cursor-pointer p-1 text-stone-400 transition-colors hover:text-red-500"
                    >
                      <Trash2 className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={currentPage}
        limit={itemsPerPage}
        total={filteredProducts.length}
        currentCount={paginatedProducts.length}
        onPageChange={setCurrentPage}
      />

      <ViewProduct
        open={selectedProduct !== null}
        product={selectedProduct}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
        onApprove={(product) => updateStatus(product, "Approved")}
        onReject={(product) => updateStatus(product, "Rejected")}
      />

      <EditProductApproval
        open={productToEdit !== null}
        product={productToEdit}
        onOpenChange={(open) => {
          if (!open) setProductToEdit(null);
        }}
        onSave={(product, productName) => {
          setProducts((current) =>
            current.map((item) => item.id === product.id ? { ...item, product: productName } : item),
          );
          setProductToEdit(null);
        }}
      />

      <DeleteModal
        open={productToDelete !== null}
        title="Delete a Product"
        itemName={productToDelete?.product}
        description={productToDelete ? `Are you sure you want to delete ${productToDelete.product}?` : undefined}
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null);
        }}
      />
    </div>
  );
}
