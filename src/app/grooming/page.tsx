import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function GroomingPage() {
  const profile = await prisma.userProfile.findFirst() || await prisma.userProfile.create({ data: {} });
  
  const ownedProducts = await prisma.groomingProduct.findMany({
    orderBy: { createdAt: 'desc' }
  });

  async function updateSkinProfile(formData: FormData) {
    "use server";
    const skinType = formData.get("skinType") as string;
    const skinCondition = formData.get("skinCondition") as string;
    
    await prisma.userProfile.update({
      where: { id: profile.id },
      data: { skinType, skinCondition }
    });
    revalidatePath("/grooming");
  }

  async function addOwnedProduct(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    
    if (name && category) {
      await prisma.groomingProduct.create({
        data: { name, category }
      });
      revalidatePath("/grooming");
    }
  }

  async function deleteProduct(id: string) {
    "use server";
    await prisma.groomingProduct.delete({ where: { id } });
    revalidatePath("/grooming");
  }

  // AI Routine Generation Logic (Mock)
  let aiRoutine = "";
  if (profile.skinType || profile.skinCondition || ownedProducts.length > 0) {
    aiRoutine = "Here is your tailored AI Grooming Routine:\n\n";
    
    aiRoutine += "**MORNING ROUTINE:**\n";
    const cleanser = ownedProducts.find(p => p.category.toLowerCase().includes('cleans'));
    if (cleanser) {
      aiRoutine += `- Wash your face using your ${cleanser.name}.\n`;
    } else {
      aiRoutine += `- Wash your face with a gentle cleanser (I recommend a salicylic acid cleanser for oily skin or a hydrating one for dry skin).\n`;
    }

    const moisturizer = ownedProducts.find(p => p.category.toLowerCase().includes('moisturiz'));
    if (moisturizer) {
      aiRoutine += `- Apply your ${moisturizer.name} while your skin is still damp.\n`;
    } else {
      aiRoutine += `- Apply a moisturizer suited for ${profile.skinType || 'your'} skin.\n`;
    }
    
    aiRoutine += `- NEVER skip sunscreen (SPF 50+).\n\n`;

    aiRoutine += "**EVENING ROUTINE:**\n";
    aiRoutine += `- Cleanse again to remove dirt/sunscreen.\n`;
    if (profile.skinCondition && profile.skinCondition.toLowerCase().includes('acne')) {
      aiRoutine += `- Apply a targeted acne treatment (e.g., Benzoyl Peroxide or Adapalene gel - *Medical Product*).\n`;
    }
    aiRoutine += `- Moisturize before bed.\n\n`;

    aiRoutine += "**WEEKLY / HOMEMADE:**\n";
    if (profile.skinType === 'oily') {
      aiRoutine += `- Try a homemade Multani Mitti (Fuller's earth) and rose water face pack twice a week to control oil.\n`;
    } else if (profile.skinType === 'dry') {
      aiRoutine += `- Try a homemade honey and yogurt mask once a week for deep hydration.\n`;
    } else {
      aiRoutine += `- Use a gentle exfoliator once a week to remove dead skin cells.\n`;
    }
  } else {
    aiRoutine = "Update your skin profile and add your products above to get a personalized AI routine!";
  }

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-6">Grooming & Skincare</h1>

      {/* Skin Profile Form */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm mb-6 border border-zinc-100 dark:border-zinc-700">
        <h2 className="text-lg font-semibold mb-4">Skin Analysis Profile</h2>
        <form action={updateSkinProfile} className="flex flex-col gap-3">
          <div>
            <label className="block text-sm text-zinc-500 mb-1">Skin Type</label>
            <select name="skinType" defaultValue={profile.skinType || ""} className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent">
              <option value="">-- Select Skin Type --</option>
              <option value="oily">Oily</option>
              <option value="dry">Dry</option>
              <option value="combination">Combination</option>
              <option value="normal">Normal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-500 mb-1">Skin Conditions (Acne, Scars, Dark Circles, etc.)</label>
            <input 
              name="skinCondition" 
              defaultValue={profile.skinCondition || ""}
              placeholder="e.g., Occasional acne, dark circles" 
              className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-xl font-medium mt-1">
            Update Profile & Get Routine
          </button>
        </form>
      </div>

      {/* Owned Products Tracker */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm mb-6 border border-zinc-100 dark:border-zinc-700">
        <h2 className="text-lg font-semibold mb-4">My Owned Products</h2>
        <form action={addOwnedProduct} className="flex gap-2 mb-4">
          <input 
            name="name" 
            placeholder="Product Name (e.g. Cetaphil Cleanser)" 
            required 
            className="border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent flex-[2]"
          />
          <input 
            name="category" 
            placeholder="Category" 
            required 
            className="border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent flex-1"
          />
          <button type="submit" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-xl font-medium shrink-0">
            Add
          </button>
        </form>

        <div className="space-y-2">
          {ownedProducts.map(p => (
            <div key={p.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <div>
                <p className="font-semibold text-sm">{p.name}</p>
                <p className="text-xs text-zinc-500 capitalize">{p.category}</p>
              </div>
              <form action={deleteProduct.bind(null, p.id)}>
                <button type="submit" className="text-red-500 hover:text-red-700 font-bold px-2">✕</button>
              </form>
            </div>
          ))}
          {ownedProducts.length === 0 && (
            <p className="text-zinc-500 text-sm">You haven't added any products yet.</p>
          )}
        </div>
      </div>

      {/* AI Suggestions Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 shadow-sm border border-blue-100 dark:border-blue-900/50">
        <h2 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">✨ AI Suggestions & Routine</h2>
        <div className="text-sm space-y-2 text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
          {aiRoutine}
        </div>
      </div>
    </div>
  );
}
