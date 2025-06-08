// components/dashboard/SellerListingsCard.tsx

import { Pencil, Trash2, DollarSign } from "lucide-react";

interface Listing {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  status: "Active" | "Sold" | "Draft";
}

interface Props {
  listings: Listing[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onMarkSold: (id: number) => void;
}

export default function SellerListingsCard({
  listings,
  onEdit,
  onDelete,
  onMarkSold,
}: Props) {
  return (
    <section className="bg-white rounded-2xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Your Listings</h2>
        {/* You can slot in a create listing button here if needed */}
      </div>
      {listings.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-base">
          You have no active listings.
        </div>
      ) : (
        <ul className="flex flex-col gap-5">
          {listings.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-5 p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-20 h-20 rounded-xl object-cover border"
              />
              <div className="flex-1">
                <div className="font-semibold text-lg text-gray-800 truncate">
                  {item.name}
                </div>
                <div className="text-sm text-gray-500">{item.category}</div>
                <div className="text-base font-bold text-teal-600 mt-1">
                  ₪{item.price}
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === "Active"
                        ? "bg-teal-100 text-teal-800"
                        : item.status === "Sold"
                        ? "bg-gray-200 text-gray-600"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-fit">
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition"
                  onClick={() => onEdit(item.id)}
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-red-100 text-red-600 text-sm font-medium transition"
                  onClick={() => onDelete(item.id)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                {item.status === "Active" && (
                  <button
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition"
                    onClick={() => onMarkSold(item.id)}
                    title="Mark as Sold"
                  >
                    <DollarSign className="w-4 h-4" />
                    Mark Sold
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
