"use client";
import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const WHATSAPP_NUMBER = "+9710551210729"; // Replace with your WhatsApp number

  useEffect(() => {
    const savedPosition = localStorage.getItem("whatsappPosition");
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    } else {
      // Default to bottom-right
      setPosition({
        x: window.innerWidth - 80,
        y: window.innerHeight - 80,
      });
    }
  }, []);

  const handleMouseDown = (e) => {
    if (isOpen) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem("whatsappPosition", JSON.stringify(position));
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragStart, position]);

  const handleClick = () => {
    if (!isDragging) {
      setIsOpen(!isOpen);
      // Move to bottom-right when closing
      if (isOpen) {
        const newPosition = {
          x: window.innerWidth - 80,
          y: window.innerHeight - 80,
        };
        setPosition(newPosition);
        localStorage.setItem("whatsappPosition", JSON.stringify(newPosition));
      }
    }
  };

  const handleSend = () => {
    if (!name.trim() || !reason.trim()) {
      alert("Please fill in both fields");
      return;
    }

    const message = `Name: ${name}\nReason: ${reason}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    
    setName("");
    setReason("");
    setIsOpen(false);
  };

  return (
    <>
      <div
        ref={buttonRef}
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 9999,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
      >
        <button
          onClick={handleClick}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </button>

        {isOpen && (
          <div
            className="absolute bottom-16 right-0 bg-white rounded-lg shadow-2xl p-4 w-80"
            style={{ cursor: "default" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-800">Contact Us</h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  const newPosition = {
                    x: window.innerWidth - 80,
                    y: window.innerHeight - 80,
                  };
                  setPosition(newPosition);
                  localStorage.setItem("whatsappPosition", JSON.stringify(newPosition));
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Name
                </label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Reason
                </label>
                <Textarea
                  placeholder="How can we help you?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full resize-none"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSend}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                Send Message
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
