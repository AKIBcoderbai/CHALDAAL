import { useState, useEffect, useMemo, use } from "react";

export default function useProducts() {

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("Grocery");
    const [searchTerm, setSearchTerm] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [sortBy, setSortBy] = useState("featured");
    const [inStockOnly, setInStockOnly] = useState(false);
    const [priceCap, setPriceCap] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await fetch("http://localhost:3000/api/products");
                const data = await response.json();

                const mappedData = data.map((item) => ({
                    id: item.id || item.product_id,
                    name: item.name,
                    price: item.price,
                    originalPrice: item.price,
                    image: item.image,
                    category: item.category,
                    unit: item.unit,
                    stock: item.stock,
                    rating:item.rating
                }));

                setProducts(mappedData);
            } catch (error) {
                console.error("Error connecting to backend:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);



    const maxProductPrice = useMemo(
        () => Math.max(...products.map((p) => Number(p.price) || 0), 0),
        [products]
    );


    useEffect(() => {
        if (maxProductPrice > 0 && priceCap === 0) {
            setPriceCap(maxProductPrice);
        }
    }, [maxProductPrice, priceCap]);

    const suggestions = useMemo(() => {
        const keyword = inputValue.trim().toLowerCase();
        if (!keyword) return [];
        return products
            .filter((p) => p.name?.toLowerCase().includes(keyword))
            .slice(0, 6);
    }, [inputValue, products]);

    const quickCategories = useMemo(() => {
        const set = new Set(products.map((p) => p.category).filter(Boolean));
        return ["All", ...Array.from(set).slice(0, 7)];
    }, [products]);

    const displayedProducts = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        let list = products.filter((p) => {
            const byQuery = query.length > 0
                ? p.name?.toLowerCase().includes(query)
                : selectedCategory === "All" || p.category === selectedCategory;

            const byStock = inStockOnly ? Number(p.stock) > 0 : true;
            const byPrice = priceCap > 0 ? Number(p.price) <= priceCap : true;
            return byQuery && byStock && byPrice;
        });

        if (sortBy === "price-asc") {
            list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === "price-desc") {
            list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
        } else if (sortBy === "name-asc") {
            list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        }

        return list;
    }, [products, searchTerm, selectedCategory, inStockOnly, priceCap, sortBy]);

    const handleInputChange = (e) => setInputValue(e.target.value);
    const handleSearchKeyBtn = () => {
        setSearchTerm(inputValue);
        setShowSuggestions(false);
    };
    const handleSearchKey = (e) => {
        if (e.key === "Enter") {
            setSearchTerm(inputValue);
            setShowSuggestions(false);
        }
    };
    const handleSelectCategory = (categoryName) => {
        setSelectedCategory(categoryName);
        setSearchTerm("");
        setInputValue("");
        setShowSuggestions(false);
    };

    return {
    isLoading,
    selectedCategory, setSelectedCategory,
    inputValue, setInputValue,
    showSuggestions, setShowSuggestions,
    suggestions, setSearchTerm,
    quickCategories,
    inStockOnly, setInStockOnly,
    priceCap, setPriceCap, maxProductPrice,
    sortBy, setSortBy,
    displayedProducts,
    handleInputChange, handleSearchKey, handleSearchKeyBtn, handleSelectCategory
  };
}