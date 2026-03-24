import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! || process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const blogs = [
  {
    id: 1,
    title: "7 ways to decor your home like a professional",
    img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1000&auto=format&fit=crop",
    date: "October 16, 2023",
    timestamp: new Date("2023-10-16").getTime(),
    description: "Discover the secrets of professional interior designers and transform your living space with these seven expert tips.",
    content: `<div>
  <h3>1. Start with a Neutral Base</h3>
  <div>Professional designers often start with neutral walls and large furniture pieces. This allows you to add personality through accessories and artwork that can be easily changed.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1000&auto=format&fit=crop" alt="Modern Room" className="w-full rounded-lg my-4" />
  <br/>
  <h3>2. Layer Your Lighting</h3>
  <div>Don't rely on just one overhead light. Use a mix of ambient, task, and accent lighting to create depth and mood in every room.</div>
  <br/>
  <h3>3. Mix Textures</h3>
  <div>Combine smooth metals with soft fabrics and rough wood. Texture adds visual interest and makes a room feel more sophisticated and inviting.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=1000&auto=format&fit=crop" alt="Texture Mix" className="w-full rounded-lg my-4" />
  <br/>
  <h3>4. Scale Matters</h3>
  <div>Ensure your furniture is the right size for the room. A tiny rug in a large room or a massive sofa in a small one will throw off the balance.</div>
  <br/>
  <h3>5. Add Greenery</h3>
  <div>Plants bring life, color, and texture to any space. They also help purify the air and create a more serene environment.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=1000&auto=format&fit=crop" alt="Plants in Decor" className="w-full rounded-lg my-4" />
  <br/>
  <h3>6. Personalize with Art</h3>
  <div>Choose pieces that speak to you. Gallery walls or one large statement piece can define the character of your home.</div>
  <br/>
  <h3>7. Don't Overcrowd</h3>
  <div>Professional design is as much about the space you leave empty as the space you fill. Give your furniture and decor room to breathe.</div>
</div>`
  },
  {
    id: 2,
    title: "Inside a beautiful kitchen organization",
    img: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=1000&auto=format&fit=crop",
    date: "October 16, 2023",
    timestamp: new Date("2023-10-16").getTime(),
    description: "A well-organized kitchen is the heart of a productive home. Explore our guide to maximizing space and efficiency in your culinary sanctuary.",
    content: `<div>
  <h3>Maximize Vertical Space</h3>
  <div>Use wall-mounted racks for spices, knives, and even pots and pans to free up valuable counter and cabinet space.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=1000&auto=format&fit=crop" alt="Kitchen Organization" className="w-full rounded-lg my-4" />
  <br/>
  <h3>Categorize Your Pantry</h3>
  <div>Group similar items together using clear containers. Not only does it look beautiful, but it also makes finding ingredients a breeze.</div>
  <br/>
  <h3>The Working Triangle</h3>
  <div>Ensure your sink, stove, and refrigerator are positioned in a way that minimizes movement while cooking. This classic layout rule remains a professional favorite.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=1000&auto=format&fit=crop" alt="Pantry" className="w-full rounded-lg my-4" />
  <br/>
  <h3>Declutter Regularly</h3>
  <div>If you haven't used a gadget in a year, it's time to find it a new home. Keep only the essentials within easy reach to maintain a professional look.</div>
</div>`
  },
  {
    id: 3,
    title: "Decor your bedroom for your children",
    img: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1000&auto=format&fit=crop",
    date: "October 16, 2023",
    timestamp: new Date("2023-10-16").getTime(),
    description: "Creating a space that grows with your child is an art. Learn how to balance fun and functionality in children's bedroom design.",
    content: `<div>
  <h3>Flexible Furniture</h3>
  <div>Choose pieces that can adapt as your child gets older. A crib that turns into a toddler bed or a desk that adjusts in height are great investments.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1000&auto=format&fit=crop" alt="Kids Bedroom" className="w-full rounded-lg my-4" />
  <br/>
  <h3>Encourage Creativity</h3>
  <div>Consider a chalkboard wall or a dedicated art station. Providing space for self-expression helps make the room truly theirs.</div>
  <br/>
  <h3>Smart Storage</h3>
  <div>Use low shelves and labeled bins to make it easy for children to tidy up after themselves. Organization can be a fun part of their routine.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=1000&auto=format&fit=crop" alt="Creative Corner" className="w-full rounded-lg my-4" />
  <br/>
  <h3>Soft Tones and Playful Accents</h3>
  <div>Start with a calming color palette for the walls and add pops of color through bedding, curtains, and toys. This ensures the room remains a relaxing place for sleep.</div>
</div>`
  },
  {
    id: 4,
    title: "Modern Texas Home: A Kid-Friendly Retreat",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
    date: "October 16, 2023",
    timestamp: new Date("2023-10-16").getTime(),
    description: "Explore a stunning Texas residence that proves modern elegance and high-energy family life can coexist beautifully.",
    content: `<div>
  <h3>Durability Meets Style</h3>
  <div>In this Texas home, performance fabrics and hardy materials are used throughout, ensuring the sophisticated design can handle anything the kids throw at it.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop" alt="Texas Living Room" className="w-full rounded-lg my-4" />
  <br/>
  <h3>Outdoor Connection</h3>
  <div>Large sliding doors lead to a safe, expansive backyard, blurring the lines between indoor play and outdoor adventure.</div>
  <br/>
  <h3>Integrated Play Zones</h3>
  <div>Instead of a separate playroom, this home features subtle play areas integrated into the living spaces, allowing the family to stay connected.</div>
</div>`
  },
  {
    id: 5,
    title: "Sustainable Living in a Modern Texas Setting",
    img: "https://images.unsplash.com/photo-1518005020250-eccad1f30a44?q=80&w=1000&auto=format&fit=crop",
    date: "October 16, 2023",
    timestamp: new Date("2023-10-16").getTime(),
    description: "Discover how eco-friendly materials and energy-efficient design are shaping the future of modern Texas architecture.",
    content: `<div>
  <h3>Solar Power Integration</h3>
  <div>This home harnesses the abundant Texas sun with sleek, integrated solar panels that power the entire property while maintaining a clean aesthetic.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1518005020250-eccad1f30a44?q=80&w=1000&auto=format&fit=crop" alt="Eco Texas Home" className="w-full rounded-lg my-4" />
  <br/>
  <h3>Native Landscaping</h3>
  <div>By using native Texas plants, the homeowners have created a beautiful, low-maintenance garden that requires minimal water and supports local wildlife.</div>
  <br/>
  <h3>Recycled Materials</h3>
  <div>From reclaimed wood flooring to recycled glass countertops, every choice reflects a commitment to the environment without sacrificing luxury.</div>
</div>`
  },
  {
    id: 6,
    title: "Rustic Charm Meets Modern Texas Design",
    img: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=1000&auto=format&fit=crop",
    date: "October 16, 2023",
    timestamp: new Date("2023-10-16").getTime(),
    description: "A unique look at a home that blends traditional farmhouse elements with contemporary industrial touches in the heart of Texas.",
    content: `<div>
  <h3>Exposed Beams and Steel</h3>
  <div>The combination of warm, reclaimed wood beams and cool black steel frames creates a dynamic contrast that defines the home's character.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=1000&auto=format&fit=crop" alt="Rustic Modern" className="w-full rounded-lg my-4" />
  <br/>
  <h3>The Modern Hearth</h3>
  <div>A minimalist stone fireplace serves as the central focal point, providing a cozy gathering spot that feels both ancient and brand new.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=1000&auto=format&fit=crop" alt="Hearth" className="w-full rounded-lg my-4" />
  <br/>
</div>`
  },
  {
    id: 7,
    title: "The Ultimate Open-Concept Texas Farmhouse",
    img: "https://images.unsplash.com/photo-1502005229762-bc1320ada1b0?q=80&w=1000&auto=format&fit=crop",
    date: "October 16, 2023",
    timestamp: new Date("2023-10-16").getTime(),
    description: "See how open-concept living can feel intimate and cozy in this sprawling modern farmhouse design.",
    content: `<div>
  <h3>Zones Without Walls</h3>
  <div>Using rugs, lighting, and furniture placement, this home creates distinct living, dining, and cooking areas within one large, airy space.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1502005229762-bc1320ada1b0?q=80&w=1000&auto=format&fit=crop" alt="Open Farmhouse" className="w-full rounded-lg my-4" />
  <br/>
  <h3>High Ceilings, Warm Textures</h3>
  <div>While the ceilings are vaulted and grand, the use of limestone and oak ensures the space feels warm and grounded.</div>
</div>`
  },
  {
    id: 8,
    title: "Minimalist Elegance in a Texas Suburb",
    img: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=1000&auto=format&fit=crop",
    date: "October 16, 2023",
    timestamp: new Date("2023-10-16").getTime(),
    description: "A masterclass in 'less is more', this suburban Texas home focuses on quality materials and clean lines.",
    content: `<div>
  <h3>Monochromatic Magic</h3>
  <div>By sticking to a palette of whites, greys, and blacks, the architecture of the home becomes the primary focus, creating a sense of calm.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=1000&auto=format&fit=crop" alt="Minimalist Bedroom" className="w-full rounded-lg my-4" />
  <br/>
  <h3>Hidden Storage</h3>
  <div>Seamless cabinetry hides away the clutter of daily life, maintaining the pristine, minimalist look throughout the home.</div>
</div>`
  },
  {
    id: 9,
    title: "Industrial Design in a Texas Urban Loft",
    img: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=1000&auto=format&fit=crop",
    date: "October 16, 2023",
    timestamp: new Date("2023-10-16").getTime(),
    description: "Steel, brick, and concrete come together in this urban loft that celebrates the raw beauty of Texas's industrial history.",
    content: `<div>
  <h3>Concrete Countertops</h3>
  <div>Hand-poured concrete provides a durable and edgy surface in the kitchen, perfectly complementing the original brick walls.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=1000&auto=format&fit=crop" alt="Industrial Kitchen" className="w-full rounded-lg my-4" />
  <br/>
  <h3>Vintage Finds</h3>
  <div>The loft is furnished with a copy of modern pieces and industrial antiques, giving the space a lived-in and authentic feel.</div>
</div>`
  },
  {
    id: 10,
    title: "Color pallettes for ultimate relaxation",
    img: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1000&auto=format&fit=crop",
    date: "October 17, 2023",
    timestamp: new Date("2023-10-17").getTime(),
    description: "Learn how to use color psychology to create a tranquil and restorative home environment.",
    content: `<div>
  <h3>Soft Blues and Greens</h3>
  <div>These cool tones are proven to lower heart rates and create a sense of peace, making them perfect for bedrooms and bathrooms.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1000&auto=format&fit=crop" alt="Relaxing Blue Room" className="w-full rounded-lg my-4" />
  <br/>
  <h3>Warm Neutrals</h3>
  <div>Beiges, taupes, and soft greys provide a stable and comforting backdrop that feels secure and timeless.</div>
  <br/>
  <h3>Avoid High-Energy Hues</h3>
  <div>While bright reds and yellows are great for social spaces, keep them away from your relaxation zones to avoid overstimulation.</div>
</div>`
  },
  {
    id: 11,
    title: "Lighting fixtures to make your modern space pop",
    img: "https://images.unsplash.com/photo-1513506494749-1644c3a9fdeb?q=80&w=1000&auto=format&fit=crop",
    date: "October 18, 2023",
    timestamp: new Date("2023-10-18").getTime(),
    description: "Think of lighting as the jewelry of your home. Discover how to choose fixtures that make a statement.",
    content: `<div>
  <h3>Statement Chandeliers</h3>
  <div>A large, modern chandelier can define a dining area and serve as a stunning piece of sculptural art.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1513506494749-1644c3a9fdeb?q=80&w=1000&auto=format&fit=crop" alt="Modern Lighting" className="w-full rounded-lg my-4" />
  <br/>
  <h3>Architectural Wall Sconces</h3>
  <div>Sconces aren't just for bathrooms; use them in hallways or over bedside tables to add architectural interest.</div>
  <br/>
  <h3>Dimmable Everything</h3>
  <div>The key to great lighting is control. Dimmers allow you to adjust the mood of your home instantly for any occasion.</div>
</div>`
  },
  {
    id: 12,
    title: "How to safely secure furniture around toddlers",
    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop",
    date: "October 19, 2023",
    timestamp: new Date("2023-10-19").getTime(),
    description: "A essential guide to child-proofing your home without sacrificing your interior design vision.",
    content: `<div>
  <h3>Anchoring Heavy Pieces</h3>
  <div>Always use wall anchors for bookshelves, dressers, and TVs. It's a simple step that provides invaluable peace of mind.</div>
  <br/>
  <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop" alt="Safe Living Space" className="w-full rounded-lg my-4" />
  <br/>
  <h3>Corner Guards and Soft Latches</h3>
  <div>Transparent corner guards and magnetic cabinet locks provide safety while remaining largely invisible to the eye.</div>
  <br/>
  <h3>Furniture Placement</h3>
  <div>Position lower, heavier items in front of potentially tippable furniture to create a natural barrier.</div>
</div>`
  }
];

export async function GET() {
  try {
    const results = [];
    for (const blog of blogs) {
      const { data, error } = await supabase
        .from("blogs")
        .upsert(blog)
        .select();
      
      if (error) {
        results.push({ id: blog.id, status: "error", error });
      } else {
        results.push({ id: blog.id, status: "success" });
      }
    }
    
    return NextResponse.json({ message: "Seeding complete", results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
