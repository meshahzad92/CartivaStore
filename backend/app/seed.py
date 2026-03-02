"""
Seed script — populate the database with sample products and testimonials.

Usage:
    cd backend
    python -m app.seed
"""

from app.db.session import SessionLocal
from app.db.base import Base
from app.db.session import engine
from app.models.product import Product
from app.models.testimonial import Testimonial

# Ensure tables exist
Base.metadata.create_all(bind=engine)

SAMPLE_PRODUCTS = [
    {
        "name": "Classic Leather Jacket",
        "description": "Crafted from premium full-grain leather with a tailored silhouette. Features a YKK zip closure, two interior pockets, and quilted lining for comfort. An investment piece that ages beautifully.",
        "price": 189.99,
        "original_price": 249.99,
        "category": "outerwear",
        "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
        ],
        "stock": 50,
        "rating": 4.8,
        "reviews": 124,
        "badge": "Best Seller",
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 189.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 349.99, "label": "Buy 2", "tag": "Save $30"},
            {"qty": 3, "price": 499.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Leather Care Kit", "price": 29.99},
    },
    {
        "name": "Minimalist Canvas Sneakers",
        "description": "Clean-cut canvas sneakers with a vulcanized rubber sole. Breathable cotton upper, padded collar, and a cushioned insole for all-day comfort. Effortlessly versatile.",
        "price": 79.99,
        "original_price": 99.99,
        "category": "footwear",
        "image_url": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=600&fit=crop",
        ],
        "stock": 80,
        "rating": 4.6,
        "reviews": 89,
        "badge": None,
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 79.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 149.99, "label": "Buy 2", "tag": "Save $10"},
            {"qty": 3, "price": 209.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Premium Shoe Cleaner", "price": 14.99},
    },
    {
        "name": "Oversized Wool Coat",
        "description": "Luxurious wool-blend coat with a relaxed oversized fit. Double-breasted closure, notch lapels, and fully lined interior. Perfect for layering in transitional weather.",
        "price": 249.99,
        "original_price": 349.99,
        "category": "outerwear",
        "image_url": "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=600&fit=crop",
        ],
        "stock": 30,
        "rating": 4.9,
        "reviews": 67,
        "badge": "New Arrival",
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 249.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 469.99, "label": "Buy 2", "tag": "Save $30"},
            {"qty": 3, "price": 679.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Wool Brush Set", "price": 19.99},
    },
    {
        "name": "Slim Fit Chino Pants",
        "description": "Tailored chinos in a modern slim-fit silhouette. Made from stretch cotton twill for freedom of movement. Features a zip fly, button waist, and slant pockets.",
        "price": 59.99,
        "original_price": None,
        "category": "bottoms",
        "image_url": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop",
        ],
        "stock": 100,
        "rating": 4.5,
        "reviews": 203,
        "badge": None,
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 59.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 109.99, "label": "Buy 2", "tag": "Save $10"},
            {"qty": 3, "price": 154.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Fabric Stain Guard Spray", "price": 12.99},
    },
    {
        "name": "Cashmere Blend Sweater",
        "description": "Ultra-soft cashmere-blend sweater with a relaxed crew neck. Ribbed cuffs and hem for a polished finish. Lightweight enough for layering yet warm enough on its own.",
        "price": 129.99,
        "original_price": 169.99,
        "category": "tops",
        "image_url": "https://images.unsplash.com/photo-1434389677669-e08b4cda3471?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1434389677669-e08b4cda3471?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=600&fit=crop",
        ],
        "stock": 60,
        "rating": 4.7,
        "reviews": 156,
        "badge": "Popular",
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 129.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 239.99, "label": "Buy 2", "tag": "Save $20"},
            {"qty": 3, "price": 339.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Cashmere Comb", "price": 9.99},
    },
    {
        "name": "Premium Denim Jeans",
        "description": "Japanese selvedge denim with a modern straight-leg cut. Features a button fly, five-pocket styling, and raw unfaded finish that develops unique character over time.",
        "price": 89.99,
        "original_price": 119.99,
        "category": "bottoms",
        "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=600&fit=crop",
        ],
        "stock": 70,
        "rating": 4.4,
        "reviews": 312,
        "badge": None,
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 89.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 164.99, "label": "Buy 2", "tag": "Save $15"},
            {"qty": 3, "price": 234.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Denim Wash Kit", "price": 14.99},
    },
    {
        "name": "Structured Tote Bag",
        "description": "Architectural tote bag in vegetable-tanned leather. Features a magnetic snap closure, interior zip pocket, and structured base. Fits up to a 15\" laptop comfortably.",
        "price": 149.99,
        "original_price": None,
        "category": "accessories",
        "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
        ],
        "stock": 40,
        "rating": 4.8,
        "reviews": 78,
        "badge": "Editor's Pick",
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 149.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 279.99, "label": "Buy 2", "tag": "Save $20"},
            {"qty": 3, "price": 399.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Leather Conditioner", "price": 18.99},
    },
    {
        "name": "Linen Button-Down Shirt",
        "description": "Breathable pure linen shirt with a relaxed button-down collar. Garment-washed for a lived-in softness. A warm-weather essential with effortless elegance.",
        "price": 69.99,
        "original_price": 89.99,
        "category": "tops",
        "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600&h=600&fit=crop",
        ],
        "stock": 90,
        "rating": 4.3,
        "reviews": 95,
        "badge": None,
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 69.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 129.99, "label": "Buy 2", "tag": "Save $10"},
            {"qty": 3, "price": 179.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Linen Wrinkle Spray", "price": 11.99},
    },
    {
        "name": "Aviator Sunglasses",
        "description": "Titanium-frame aviator sunglasses with polarized CR-39 lenses. Provides 100% UV protection with anti-reflective coating. Includes a hardshell case and microfiber cloth.",
        "price": 139.99,
        "original_price": 179.99,
        "category": "accessories",
        "image_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop",
        ],
        "stock": 55,
        "rating": 4.6,
        "reviews": 187,
        "badge": "Trending",
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 139.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 259.99, "label": "Buy 2", "tag": "Save $20"},
            {"qty": 3, "price": 369.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Premium Lens Cleaner", "price": 9.99},
    },
    {
        "name": "Merino Wool Scarf",
        "description": "Extra-fine merino wool scarf with a subtle herringbone pattern. Naturally temperature-regulating and moisture-wicking. Generously sized for versatile styling.",
        "price": 49.99,
        "original_price": None,
        "category": "accessories",
        "image_url": "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=600&fit=crop",
        ],
        "stock": 65,
        "rating": 4.5,
        "reviews": 64,
        "badge": None,
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 49.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 89.99, "label": "Buy 2", "tag": "Save $10"},
            {"qty": 3, "price": 129.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Merino Scarf Ring", "price": 12.99},
    },
    {
        "name": "Performance Running Shoes",
        "description": "Engineered mesh running shoes with responsive foam midsole. Features a carbon-fiber plate for energy return, breathable knit upper, and reflective accents for low-light visibility.",
        "price": 159.99,
        "original_price": 199.99,
        "category": "footwear",
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop",
        ],
        "stock": 45,
        "rating": 4.7,
        "reviews": 245,
        "badge": "Best Seller",
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 159.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 299.99, "label": "Buy 2", "tag": "Save $20"},
            {"qty": 3, "price": 429.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Performance Insoles", "price": 24.99},
    },
    {
        "name": "Quilted Puffer Vest",
        "description": "Lightweight quilted vest with recycled synthetic fill. Features a stand collar, two-way zip, and elastic binding at armholes. Packable design fits into its own pocket.",
        "price": 109.99,
        "original_price": 139.99,
        "category": "outerwear",
        "image_url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop",
        ],
        "stock": 35,
        "rating": 4.4,
        "reviews": 113,
        "badge": None,
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 109.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 199.99, "label": "Buy 2", "tag": "Save $20"},
            {"qty": 3, "price": 284.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Garment Storage Bag", "price": 14.99},
    },
    {
        "name": "Graphic Cotton T-Shirt",
        "description": "Heavyweight organic cotton t-shirt with a minimalist graphic print. Pre-shrunk and garment-dyed for a vintage feel. Relaxed unisex fit with reinforced shoulder seams.",
        "price": 34.99,
        "original_price": None,
        "category": "tops",
        "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop",
        ],
        "stock": 120,
        "rating": 4.2,
        "reviews": 421,
        "badge": None,
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 34.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 59.99, "label": "Buy 2", "tag": "Save $10"},
            {"qty": 3, "price": 84.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Fabric Softener Pack", "price": 7.99},
    },
    {
        "name": "Leather Chelsea Boots",
        "description": "Handcrafted Chelsea boots in burnished calf leather. Goodyear-welted construction with a Vibram rubber sole. Elastic side panels and pull tab for easy on/off.",
        "price": 199.99,
        "original_price": 259.99,
        "category": "footwear",
        "image_url": "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&h=600&fit=crop",
        ],
        "stock": 25,
        "rating": 4.9,
        "reviews": 92,
        "badge": "Premium",
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 199.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 374.99, "label": "Buy 2", "tag": "Save $25"},
            {"qty": 3, "price": 539.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Boot Polish Set", "price": 19.99},
    },
    {
        "name": "Stretch Jogger Pants",
        "description": "Technical jogger pants with a tapered leg and elastic cuffs. Made from four-way stretch fabric with DWR coating. Features zip pockets and a drawstring waist.",
        "price": 54.99,
        "original_price": 69.99,
        "category": "bottoms",
        "image_url": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1584865288642-42078afe6942?w=600&h=600&fit=crop",
        ],
        "stock": 75,
        "rating": 4.5,
        "reviews": 178,
        "badge": None,
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 54.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 99.99, "label": "Buy 2", "tag": "Save $10"},
            {"qty": 3, "price": 139.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Drawstring Upgrade Pack", "price": 8.99},
    },
    {
        "name": "Minimalist Leather Watch",
        "description": "Swiss-made quartz movement with a brushed stainless steel case. Sapphire crystal glass, Italian leather strap, and water-resistant to 50 meters. Understated luxury.",
        "price": 219.99,
        "original_price": 279.99,
        "category": "accessories",
        "image_url": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop",
        "images": [
            "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop",
            "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=600&fit=crop",
        ],
        "stock": 20,
        "rating": 4.8,
        "reviews": 156,
        "badge": "Limited Edition",
        "in_stock": True,
        "packages": [
            {"qty": 1, "price": 219.99, "label": "Buy 1", "tag": None},
            {"qty": 2, "price": 409.99, "label": "Buy 2", "tag": "Save $30"},
            {"qty": 3, "price": 589.99, "label": "Buy 3", "tag": "Best Deal"},
        ],
        "add_on": {"name": "Extra Watch Strap", "price": 34.99},
    },
]

SAMPLE_TESTIMONIALS = [
    {
        "name": "Sarah Mitchell",
        "message": "Absolutely love the quality of everything I've ordered. The leather jacket exceeded my expectations — the craftsmanship is outstanding. Will definitely be ordering again!",
        "rating": 5,
    },
    {
        "name": "James Rodriguez",
        "message": "Fast shipping and the sneakers fit perfectly. The attention to detail in every product is impressive. Cartiva has become my go-to store for premium essentials.",
        "rating": 5,
    },
    {
        "name": "Emily Chen",
        "message": "The cashmere sweater is incredibly soft and the color is exactly as shown. Customer service was helpful when I needed to exchange sizes. Great experience overall.",
        "rating": 4,
    },
    {
        "name": "Marcus Thompson",
        "message": "I've been shopping at Cartiva for over a year and the quality is consistently excellent. The Chelsea boots I bought are still in perfect condition after daily wear.",
        "rating": 5,
    },
    {
        "name": "Olivia Park",
        "message": "The tote bag is stunning and incredibly functional. It fits everything I need for work and still looks elegant. The vegetable-tanned leather is developing a beautiful patina.",
        "rating": 5,
    },
    {
        "name": "David Kim",
        "message": "Ordered the watch as a gift and the recipient was thrilled. The minimalist design is perfect for everyday wear. Beautifully packaged too — felt like a luxury unboxing.",
        "rating": 4,
    },
]


def seed() -> None:
    """Insert sample data into the database."""
    db = SessionLocal()
    try:
        # Check if data already exists
        existing_products = db.query(Product).count()
        if existing_products > 0:
            print(f"Database already has {existing_products} products. Skipping seed.")
            return

        # Insert products
        for product_data in SAMPLE_PRODUCTS:
            db.add(Product(**product_data))

        # Insert testimonials
        for testimonial_data in SAMPLE_TESTIMONIALS:
            db.add(Testimonial(**testimonial_data))

        db.commit()
        print(f"✅ Seeded {len(SAMPLE_PRODUCTS)} products and {len(SAMPLE_TESTIMONIALS)} testimonials.")
    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
