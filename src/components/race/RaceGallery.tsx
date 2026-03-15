'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface RaceGalleryProps {
  images: string[];
  city: string;
}

const RaceGallery = ({ images, city }: RaceGalleryProps) => {
  if (!images || images.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="font-display font-black text-2xl text-white uppercase italic mb-6">
        Explore {city}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((src, i) => (
          <motion.div
            key={src}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`relative overflow-hidden rounded-2xl aspect-[4/3] group cursor-zoom-in ${
              i === 0 ? 'md:col-span-2 md:row-span-2' : ''
            }`}
          >
            <img
              src={src}
              alt={`${city} gallery image ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RaceGallery;
