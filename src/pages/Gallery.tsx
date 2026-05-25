import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios"; 

type GalleryItem = {
  id: number;
  image_url: string;
  title: string;
  catagory: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery()
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await axios.get("https://eventglow-backend.onrender.com/api/gallery/");
      setImages(res.data);
    } catch(err) {
      console.error(err);
    } finally{
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex item-center justify-center h-[60vh]">
        <p>Loading...</p>
      </div>
    )
  }
  
  return (
    <div>
      <section className="gradient-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl font-bold text-primary-foreground">Event Gallery</h1>
          <p className="mt-2 text-primary-foreground/80">A glimpse into our beautifully crafted celebrations</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {images.map((img, i) => (
            <motion.div 
              key={img.id} 
              initial={{ opacity: 0, y: 16 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: i * 0.06 }}
              className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border shadow-card transition-shadow hover:shadow-card-hover">
              <img 
                src={img.image_url} 
                alt={img.title} loading="lazy" 
                width={800} height={600}
                className="w-full object-cover transition-transform duration-500 hover:scale-105" />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
