import React, { useState, useEffect } from "react";
import { openDB } from "idb";

const DB_NAME = "onepiece-card-db";
const STORE_NAME = "cards";

function App() {
  const [cards, setCards] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [gender, setGender] = useState("Male");
  const [image, setImage] = useState("");

  const [search, setSearch] = useState("");
  const [setFilter, setSetFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  const [selectedCard, setSelectedCard] = useState(null);

  // Open DB
  async function getDB() {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    });
  }

  // Load cards
  useEffect(() => {
    async function loadCards() {
      const db = await getDB();
      const allCards = await db.getAll(STORE_NAME);
      setCards(allCards);
    }
    loadCards();
  }, []);

  // Resize + compress image
  const handleImageUpload = (file) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxWidth = 600;
      const scaleSize = maxWidth / img.width;

      canvas.width = maxWidth;
      canvas.height = img.height * scaleSize;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const compressed = canvas.toDataURL("image/jpeg", 0.7);
      setImage(compressed);
    };

    reader.readAsDataURL(file);
  };

  // Add card
  async function addCard() {
    if (!name.trim() || !code.trim()) return;

    const newCard = {
      id: Date.now(),
      name,
      code,
      gender,
      image,
    };

    const db = await getDB();
    await db.put(STORE_NAME, newCard);

    setCards([...cards, newCard]);
    setName("");
    setCode("");
    setImage("");
  }

  // Delete card
  async function deleteCard(id) {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
    setCards(cards.filter((c) => c.id !== id));
  }

  // Filters
  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(search.toLowerCase()) ||
      card.code.toLowerCase().includes(search.toLowerCase());

    const matchesSet =
      setFilter === "" || card.code.substring(0, 4) === setFilter;

    const matchesGender =
      genderFilter === "" || card.gender === genderFilter;

    return matchesSearch && matchesSet && matchesGender;
  });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>🏴‍☠️ One Piece Card Tracker</h2>

      {/* ADD CARD FORM */}
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Card Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Card Code (OP01-001)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          style={{ marginLeft: "8px" }}
        />

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          style={{ marginLeft: "8px" }}
        >
          <option>Male</option>
          <option>Female</option>
        </select>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) handleImageUpload(file);
          }}
          style={{ marginLeft: "8px" }}
        />

        <button
          onClick={addCard}
          style={{ marginLeft: "8px" }}
        >
          Add
        </button>
      </div>

      {/* FILTERS */}
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Search name or code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={setFilter}
          onChange={(e) => setSetFilter(e.target.value)}
          style={{ marginLeft: "8px" }}
        >
          <option value="">All Sets</option>
          <option value="OP01">OP01</option>
          <option value="OP02">OP02</option>
          <option value="OP03">OP03</option>
        </select>

        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          style={{ marginLeft: "8px" }}
        >
          <option value="">All Genders</option>
          <option>Male</option>
          <option>Female</option>
        </select>
      </div>

      {/* CARD LIST */}
      <ul>
        {filteredCards.map((card) => (
          <li
            key={card.id}
            style={{
              marginBottom: "8px",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            onClick={() => setSelectedCard(card)}
          >
            <strong>{card.name}</strong> — {card.code} — {card.gender}

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteCard(card.id);
              }}
              style={{ marginLeft: "10px" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* FULLSCREEN VIEW */}
      {selectedCard && (
        <div
          onClick={() => setSelectedCard(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={selectedCard.image}
            alt=""
            style={{ maxWidth: "90%", maxHeight: "90%" }}
          />
        </div>
      )}
    </div>
  );
}

export default App;