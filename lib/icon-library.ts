import {
    // Sports & Activities
    Trophy, Activity, Dumbbell, Timer, Footprints, Swords, Circle, Target, Waves, Bike, Mountain, Tent, Fish, Sailboat,
    Medal, Crown, Flag, Hourglass, Crosshair, Shield, HeartPulse, Snowflake, Wind, Rocket,
    Volleyball, Club, MountainSnow, PersonStanding,
    // Hobbies
    Gamepad, Gamepad2, Dices, Palette, Guitar, Drum, Spade, Diamond,
    // Food
    Apple, Banana, Carrot, Cherry, Citrus, Croissant, Egg, Grape, IceCream, Milk, Nut, Pizza, Sandwich, Soup, Utensils, Wheat, Wine, Beer, Coffee,
    // Objects/Shapes
    Star, Heart, Zap, Flame, Droplets, Moon, Sun, Cloud, Umbrella, Anchor, Key, Lock, Map, Compass, Gift, Bell, Book, Briefcase, Calculator, Camera, Car, CreditCard, DollarSign, Eye, Globe, Headphones, Home, Image, Laptop, Mail, Mic, Music, Package, Pen, Phone, Plane, Printer, Radio, Scissors, Search, Settings, ShoppingBag, ShoppingCart, Smartphone, Smile, Speaker, Tag, Thermometer, ThumbsUp, Trash, Truck, Tv, User, Video, Watch, Wifi, Wrench,
    LucideIcon
} from "lucide-react";

// React Icons
import { FaBasketballBall, FaFootballBall, FaSwimmer, FaTableTennis } from "react-icons/fa";
import { IoMdFootball } from "react-icons/io";
import { GiTennisBall, GiBoxingGlove } from "react-icons/gi";

export const ICON_LIBRARY: Record<string, React.ElementType> = {
    // Sports (Lucide)
    Trophy, Activity, Dumbbell, Timer, Footprints, Swords, Circle, Target, Waves, Bike, Mountain, Tent, Fish, Sailboat,
    Medal, Crown, Flag, Hourglass, Crosshair, Shield, HeartPulse, Snowflake, Wind, Rocket,
    Volleyball, Club, MountainSnow, PersonStanding,
    // Sports (React Icons)
    Basketball: FaBasketballBall,
    AmericanFootball: FaFootballBall,
    Football: IoMdFootball,
    Swimmer: FaSwimmer,
    TableTennis: FaTableTennis,
    TennisBall: GiTennisBall,
    Boxing: GiBoxingGlove,
    // Hobbies
    Gamepad, Gamepad2, Dices, Palette, Guitar, Drum, Spade, Diamond,
    // Food
    Apple, Banana, Carrot, Cherry, Citrus, Croissant, Egg, Grape, IceCream, Milk, Nut, Pizza, Sandwich, Soup, Utensils, Wheat, Wine, Beer, Coffee,
    // Objects
    Star, Heart, Zap, Flame, Droplets, Moon, Sun, Cloud, Umbrella, Anchor, Key, Lock, Map, Compass, Gift, Bell, Book, Briefcase, Calculator, Camera, Car, CreditCard, DollarSign, Eye, Globe, Headphones, Home, Image, Laptop, Mail, Mic, Music, Package, Pen, Phone, Plane, Printer, Radio, Scissors, Search, Settings, ShoppingBag, ShoppingCart, Smartphone, Smile, Speaker, Tag, Thermometer, ThumbsUp, Trash, Truck, Tv, User, Video, Watch, Wifi, Wrench
};

export const ICON_CATEGORIES = {
    Sports: [
        "Trophy", "Activity", "Dumbbell", "Timer", "Footprints", "Swords", "Circle", "Target", "Waves", "Bike", "Mountain", "Tent", "Fish", "Sailboat",
        "Medal", "Crown", "Flag", "Hourglass", "Crosshair", "Shield", "HeartPulse", "Snowflake", "Wind", "Rocket",
        "Volleyball", "Club", "MountainSnow", "PersonStanding",
        "Basketball", "AmericanFootball", "Football", "Swimmer", "TableTennis", "TennisBall", "Boxing"
    ],
    Hobbies: ["Gamepad", "Gamepad2", "Dices", "Palette", "Guitar", "Drum", "Spade", "Diamond", "Music", "Mic", "Headphones", "Camera", "Image", "Video", "Tv", "Radio", "Book", "Pen"],
    Food: ["Apple", "Banana", "Carrot", "Cherry", "Citrus", "Croissant", "Egg", "Grape", "IceCream", "Milk", "Nut", "Pizza", "Sandwich", "Soup", "Utensils", "Wheat", "Wine", "Beer", "Coffee"],
    General: ["Star", "Heart", "Zap", "Flame", "Droplets", "Moon", "Sun", "Cloud", "Umbrella", "Anchor", "Key", "Lock", "Map", "Compass", "Gift", "Bell", "Briefcase", "Calculator", "Car", "CreditCard", "DollarSign", "Eye", "Globe", "Home", "Laptop", "Mail", "Package", "Phone", "Plane", "Printer", "Scissors", "Search", "Settings", "ShoppingBag", "ShoppingCart", "Smartphone", "Smile", "Speaker", "Tag", "Thermometer", "ThumbsUp", "Trash", "Truck", "User", "Watch", "Wifi", "Wrench"]
};
