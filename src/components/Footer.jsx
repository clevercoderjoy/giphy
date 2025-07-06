import React from 'react'
import { FaGithub, FaGlobe, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="mt-16 pt-8 border-t border-gray-800">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex gap-2 items-center mb-4">
              <img className='w-8' src="/logo.svg" alt="giphy-logo" />
              <h3 className='text-2xl font-bold tracking-tight'>GIPHY</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Discover and share the world's best GIFs, stickers, and text art.
              Find the perfect reaction for every moment with our vast collection
              of animated content.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors text-sm">Home</a></li>
              <li><a href="/favourites" className="text-gray-400 hover:text-white transition-colors text-sm">Favourites</a></li>
              <li><a href="/search" className="text-gray-400 hover:text-white transition-colors text-sm">Search</a></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="https://www.linkedin.com/in/clevercoderjoy/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedinIn size={20} />
              </a>
              <a href="https://github.com/clevercoderjoy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaGithub size={20} />
              </a>
              <a href="https://www.twitter.com/clevercoderjoy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaXTwitter size={20} />
              </a>
              <a href="https://clevercoderjoy.bio.link" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaGlobe size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-6 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 GIPHY Clone. Built with ❤️ by CleverCoderJoy
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer