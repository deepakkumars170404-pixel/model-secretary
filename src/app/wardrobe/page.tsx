import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function WardrobePage() {
  const clothes = await prisma.clothingItem.findMany({
    orderBy: { createdAt: 'desc' }
  });

  async function addClothing(formData: FormData) {
    "use server";
    const type = formData.get("type") as string;
    const color = formData.get("color") as string;
    const description = formData.get("description") as string;
    
    if (type && color) {
      await prisma.clothingItem.create({
        data: { type, color, description }
      });
      revalidatePath("/wardrobe");
    }
  }

  async function deleteClothing(id: string) {
    "use server";
    await prisma.clothingItem.delete({ where: { id } });
    revalidatePath("/wardrobe");
  }

  // Very basic matching suggestion logic
  const shirts = clothes.filter(c => c.type === "shirt");
  const pants = clothes.filter(c => c.type === "pants");
  let suggestion = "Add more shirts and pants to get suggestions!";
  
  if (shirts.length > 0 && pants.length > 0) {
    // Pick random shirt and pants for now
    const randomShirt = shirts[Math.floor(Math.random() * shirts.length)];
    const randomPants = pants[Math.floor(Math.random() * pants.length)];
    suggestion = `Try pairing your ${randomShirt.color} ${randomShirt.description || "shirt"} with your ${randomPants.color} ${randomPants.description || "pants"} today.`;
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Digital Wardrobe</h1>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl p-5 shadow-sm mb-8">
        <h2 className="text-lg font-bold mb-2">✨ Today's Outfit Match</h2>
        <p className="text-sm/relaxed">{suggestion}</p>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm mb-8 border border-zinc-100 dark:border-zinc-700">
        <h2 className="text-lg font-semibold mb-4">Add Item</h2>
        <form action={addClothing} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <select name="type" className="border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent">
              <option value="shirt">👕 Shirt</option>
              <option value="pants">👖 Pants</option>
            </select>
            <input 
              name="color" 
              placeholder="Color (e.g. Black)" 
              required 
              className="border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent flex-1"
            />
          </div>
          <input 
            name="description" 
            placeholder="Description (e.g. Denim Jacket)" 
            className="border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent"
          />
          <button type="submit" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-xl font-medium mt-1">Add to Wardrobe</button>
        </form>
      </div>

      <h2 className="text-lg font-semibold mb-3">Your Closet</h2>
      <div className="grid grid-cols-2 gap-3">
        {clothes.map(item => (
          <div key={item.id} className="relative bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
            <form action={deleteClothing.bind(null, item.id)} className="absolute top-2 right-2">
              <button type="submit" className="text-zinc-400 hover:text-red-500 text-xs">✕</button>
            </form>
            <span className="text-4xl mb-2">{item.type === 'shirt' ? '👕' : '👖'}</span>
            <p className="font-bold text-sm capitalize">{item.color}</p>
            {item.description && <p className="text-xs text-zinc-500">{item.description}</p>}
          </div>
        ))}
      </div>
      {clothes.length === 0 && (
        <p className="text-zinc-500 text-sm">Your closet is empty.</p>
      )}
    </div>
  );
}
