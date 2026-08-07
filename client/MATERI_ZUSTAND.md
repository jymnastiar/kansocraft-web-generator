# Panduan & Materi Lengkap Zustand: Studi Kasus Project Todo List

Dokumen ini berisi materi pembelajaran **Zustand** dari tingkat dasar hingga tingkat lanjut (*advanced patterns*) berbasis pada codebase nyata proyek **Todo List** ini.

---

## 📋 Daftar Isi

1. [Pengenalan Zustand](#1-pengenalan-zustand)
2. [Arsitektur & Struktur Folder Proyek](#2-arsitektur--struktur-folder-proyek)
3. [Studi Kasus 1: Slice Pattern (Pemisahan State)](#3-studi-kasus-1-slice-pattern-pemisahan-state)
4. [Penjelasan Lengkap Setiap Action (Fungsi Store)](#4-penjelasan-lengkap-setiap-action-fungsi-store)
5. [Studi Kasus 2: Middleware Immer (Mutasi State yang Aman)](#5-studi-kasus-2-middleware-immer-mutasi-state-yang-aman)
6. [Studi Kasus 3: Middleware Persist (Auto Save ke LocalStorage)](#6-studi-kasus-3-middleware-persist-auto-save-ke-localstorage)
7. [Studi Kasus 4: Menggabungkan Slice menjadi Single Store](#7-studi-kasus-4-menggabungkan-slice-menjadi-single-store)
8. [Studi Kasus 5: Konsumsi Store di Komponen React dengan Selector](#8-studi-kasus-5-konsumsi-store-di-komponen-react-dengan-selector)
9. [Rangkuman Best Practices](#9-rangkuman-best-practices)

---

## 1. Pengenalan Zustand

**Zustand** (bahasa Jerman untuk *"kondisi"* / *"state"*) adalah pustaka State Management global yang sangat ringan, cepat, dan intuitif untuk aplikasi React.

### Mengapa Memilih Zustand?

| Fitur / Alasan | Zustand | React Context API | Redux Toolkit |
| :--- | :--- | :--- | :--- |
| **Boilerplate Code** | Sangat sedikit | Sedikit | Lumayan banyak |
| **Provider Component** | **Tidak Perlu** (No `<Provider>`) | Perlu `<Context.Provider>` | Perlu `<Provider>` |
| **Re-render Optimization** | Sangat efisien (Selector-based) | Berpotensi re-render seluruh sub-tree | Efisien (Selector-based) |
| **Kurva Pembelajaran** | Mudah & cepat | Mudah | Sedang - Kompleks |
| **Ukuran Bundle** | ~1.5 KB | 0 KB (Built-in) | ~10 KB+ |

---

## 2. Arsitektur & Struktur Folder Proyek

Dalam proyek ini, state diorganisasikan secara rapi dan modular.

```text
src/
├── types/
│   ├── todoItem.ts      # Type definition untuk 1 item Todo
│   └── store.ts         # Combined Store interface (TodoSlice & FilterSlice)
├── stores/
│   ├── todo-slice.tsx   # Slice state khusus operasi Todo (CRUD)
│   ├── filter-slice.tsx # Slice state khusus penyaringan & pengurutan
│   └── store.tsx        # File utama penggabungan store + Middleware (Immer & Persist)
└── App.tsx              # Komponen UI yang mengkonsumsi store
```

---

## 3. Studi Kasus 1: Slice Pattern (Pemisahan State)

### Konsep
Ketika aplikasi bertambah besar, menumpuk semua state dan action dalam satu file store akan membingungkan. **Slice Pattern** memungkinkan kita memecah state management menjadi potongan-potongan kecil (*slices*) sesuai fitur domainnya.

### 1. Definisi Type Item & Combined Store

- File: [`src/types/todoItem.ts`](file:///c:/Users/fadhli/Desktop/FUN_CODE/React/todo-with-zustand/src/types/todoItem.ts)
```typescript
export interface TodoItem {
  id: string;
  task: string;
  isEdit: boolean;
  isComplete: boolean;
}
```

- File: [`src/types/store.ts`](file:///c:/Users/fadhli/Desktop/FUN_CODE/React/todo-with-zustand/src/types/store.ts)
```typescript
import type { FilterSlice } from "@/stores/filter-slice";
import type { TodoSlice } from "@/stores/todo-slice";

// Menggabungkan semua tipe slice menjadi 1 Store utama
export type Store = TodoSlice & FilterSlice;
```

### 2. Kode Lengkap Todo Slice

File: [`src/stores/todo-slice.tsx`](file:///c:/Users/fadhli/Desktop/FUN_CODE/React/todo-with-zustand/src/stores/todo-slice.tsx)

```typescript
import type { Store } from "@/types/store";
import type { TodoItem } from "@/types/todoItem";
import { type StateCreator } from "zustand";

interface TodoState {
  todos: TodoItem[];
}

interface TodoAction {
  createTodo: (item: TodoItem) => void;
  removeTodo: (itemId: string) => void;
  editTodo: (itemId: string, value: string) => void;
  checkTodo: (itemId: string) => void;
  removeAll: () => void;
}

export type TodoSlice = TodoState & TodoAction;

const initialState: TodoState = {
  todos: [],
};

export const createTodoSlice: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  TodoSlice
> = (set) => ({
  ...initialState,

  createTodo: (item) => {
    set((state) => {
      state.todos.push(item);
    });
  },

  removeTodo: (itemId) => {
    set((state) => {
      state.todos = state.todos.filter((item) => item.id !== itemId);
    });
  },

  editTodo: (itemId, value) => {
    set((state) => {
      const todoItem = state.todos.find((item) => item.id === itemId);
      if (todoItem) {
        todoItem.isEdit = !todoItem.isEdit;
        todoItem.task = value;
      }
    });
  },

  checkTodo: (itemId) => {
    set((state) => {
      const todoItem = state.todos.find((item) => item.id === itemId);
      if (todoItem) {
        todoItem.isComplete = !todoItem.isComplete;
      }
    });
  },

  removeAll: () =>
    set((state) => {
      state.todos = [];
    }),
});
```

### 3. Kode Lengkap Filter Slice

File: [`src/stores/filter-slice.tsx`](file:///c:/Users/fadhli/Desktop/FUN_CODE/React/todo-with-zustand/src/stores/filter-slice.tsx)

```typescript
import type { Store } from "@/types/store";
import type { StateCreator } from "zustand";

export type FilterStatus = "all" | "completed" | "active";
export type SortOrder = "none" | "asc" | "desc";

interface FilterState {
  statusFilter: FilterStatus;
  sortOrder: SortOrder;
}

interface FilterAction {
  setStatusFilter: (status: FilterStatus) => void;
  setSortOrder: (status: SortOrder) => void;
}

export type FilterSlice = FilterState & FilterAction;

export const createFilterSlice: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  FilterSlice
> = (set) => ({
  statusFilter: "all",
  sortOrder: "none",

  setStatusFilter(status) {
    set((state) => {
      state.statusFilter = status;
    });
  },

  setSortOrder(order) {
    set((state) => {
      state.sortOrder = order;
    });
  },
});
```

> **Penjelasan Kunci**: `StateCreator<Store, [["zustand/immer", never]], [], SliceType>` adalah tipe generik Zustand yang memberitahu TypeScript bahwa slice ini merupakan bagian dari `Store` global dan menggunakan middleware `immer`.

---

## 4. Penjelasan Lengkap Setiap Action (Fungsi Store)

Berikut adalah rincian detail seluruh action (fungsi manipulator state) yang digunakan dalam proyek ini:

### 🟢 Action pada `TodoSlice`

#### 1. `createTodo(item: TodoItem)`
- **Fungsi**: Menambahkan item todo baru ke dalam list.
- **Implementasi**:
  ```typescript
  createTodo: (item) => {
    set((state) => {
      state.todos.push(item);
    });
  }
  ```
- **Cara Kerja**: Memanfaatkan `push()` dari Immer untuk menambahkan elemen `TodoItem` langsung ke akhir array `state.todos`.

#### 2. `removeTodo(itemId: string)`
- **Fungsi**: Menghapus todo spesifik dari list berdasarkan ID.
- **Implementasi**:
  ```typescript
  removeTodo: (itemId) => {
    set((state) => {
      state.todos = state.todos.filter((item) => item.id !== itemId);
    });
  }
  ```
- **Cara Kerja**: Menyaring array `state.todos` dan hanya menyisakan item yang ID-nya tidak sama dengan `itemId` yang ingin dihapus.

#### 3. `editTodo(itemId: string, value: string)`
- **Fungsi**: Mengubah mode edit todo (`isEdit`) dan memperbarui teks tugas (`task`).
- **Implementasi**:
  ```typescript
  editTodo: (itemId, value) => {
    set((state) => {
      const todoItem = state.todos.find((item) => item.id === itemId);
      if (todoItem) {
        todoItem.isEdit = !todoItem.isEdit;
        todoItem.task = value;
      }
    });
  }
  ```
- **Cara Kerja**: Mencari objek todo dengan `.find()`. Jika ditemukan, properti `isEdit` akan di-toggle (aktif/non-aktif) dan isi `task` diperbarui dengan parameter `value`.

#### 4. `checkTodo(itemId: string)`
- **Fungsi**: Mengubah status penyelesaian todo (Selesai / Belum Selesai).
- **Implementasi**:
  ```typescript
  checkTodo: (itemId) => {
    set((state) => {
      const todoItem = state.todos.find((item) => item.id === itemId);
      if (todoItem) {
        todoItem.isComplete = !todoItem.isComplete;
      }
    });
  }
  ```
- **Cara Kerja**: Mencari todo berdasarkan ID, lalu membalik nilai boolean `isComplete` (`true` menjadi `false`, atau sebaliknya).

#### 5. `removeAll()`
- **Fungsi**: Menghapus seluruh todo sekaligus.
- **Implementasi**:
  ```typescript
  removeAll: () =>
    set((state) => {
      state.todos = [];
    })
  ```
- **Cara Kerja**: Mengosongkan array `state.todos` menjadi array kosong `[]`.

---

### 🔵 Action pada `FilterSlice`

#### 6. `setStatusFilter(status: FilterStatus)`
- **Fungsi**: Mengubah kriteria filter status tampilan (`"all"` | `"completed"` | `"active"`).
- **Implementasi**:
  ```typescript
  setStatusFilter(status) {
    set((state) => {
      state.statusFilter = status;
    });
  }
  ```
- **Cara Kerja**: Mengganti string state `statusFilter` dengan opsi status baru yang dipilih pengguna.

#### 7. `setSortOrder(order: SortOrder)`
- **Fungsi**: Mengatur urutan abjad task (`"none"` | `"asc"` | `"desc"`).
- **Implementasi**:
  ```typescript
  setSortOrder(order) {
    set((state) => {
      state.sortOrder = order;
    });
  }
  ```
- **Cara Kerja**: Mengisi state `sortOrder` dengan arah pengurutan yang diinginkan pengguna.

---

## 5. Studi Kasus 2: Middleware Immer (Mutasi State yang Aman)

### Immutability vs Mutability
Secara default di JavaScript & React, kita tidak boleh mengubah array/object secara langsung (persyaratan *immutability*):

```typescript
// Standard Zustand (Immutability):
set((state) => ({
  todos: [...state.todos, newItem]
}));
```

Dengan middleware **Immer**, kita bisa menulis kode seperti gaya mutasi biasa (`push`, mutasi properti langsung), namun secara internal Immer memprosesnya menjadi immutable snapshot secara aman.

```typescript
// Dengan Zustand + Immer Middleware:
createTodoSlice: (item) => {
  set((state) => {
    state.todos.push(item); // Aman! Menggunakan Immer.
  });
},

editTodo: (itemId, value) => {
  set((state) => {
    const todoItem = state.todos.find((item) => item.id === itemId);
    if (todoItem) {
      todoItem.isEdit = !todoItem.isEdit;
      todoItem.task = value; // Langsung ubah properti object!
    }
  });
}
```

---

## 6. Studi Kasus 3: Middleware Persist (Auto Save ke LocalStorage)

### Persist Middleware
Agar data todo list tidak hilang saat halaman direfresh, kita menggunakan middleware `persist` dari `zustand/middleware`.

File: [`src/stores/store.tsx`](file:///c:/Users/fadhli/Desktop/FUN_CODE/React/todo-with-zustand/src/stores/store.tsx)

```typescript
import { createJSONStorage, persist } from "zustand/middleware";

export const useStore = create<Store>()(
  persist(
    // ... middleware & slices
    {
      name: "my-todolist", // Key name di LocalStorage
      storage: createJSONStorage(() => localStorage), // Driver penyimpanan
    }
  )
);
```

Setiap kali ada perubahan pada state `todos`, `statusFilter`, atau `sortOrder`, Zustand akan secara otomatis menyimpan ke `localStorage` di browser dengan key `"my-todolist"`.

---

## 7. Studi Kasus 4: Menggabungkan Slice menjadi Single Store

Proses penyatuan (*binding*) semua slice dan middleware dilakukan pada file utama store.

File: [`src/stores/store.tsx`](file:///c:/Users/fadhli/Desktop/FUN_CODE/React/todo-with-zustand/src/stores/store.tsx)

```typescript
import type { Store } from "@/types/store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createFilterSlice } from "./filter-slice";
import { createTodoSlice } from "./todo-slice";

export const useStore = create<Store>()(
  persist(
    immer((...a) => ({
      ...createTodoSlice(...a),
      ...createFilterSlice(...a),
    })),
    {
      name: "my-todolist",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
```

### Rantai Middleware (Middleware Chaining):
1. **`create<Store>()`**: Membuat hook `useStore`.
2. **`persist(...)`**: Membungkus store dengan kemampuan sinkronisasi penyimpanan.
3. **`immer(...)`**: Mengaktifkan sintaks mutasi Immer di dalam fungsi `set()`.
4. **`...createTodoSlice(...a)` & `...createFilterSlice(...a)`**: Menggabungkan objek state dan action dari kedua slice.

---

## 8. Studi Kasus 5: Konsumsi Store di Komponen React dengan Selector

File: [`src/App.tsx`](file:///c:/Users/fadhli/Desktop/FUN_CODE/React/todo-with-zustand/src/App.tsx)

### Mencegah Unnecessary Re-renders dengan Selector

Zustand memungkinkan komponen memelihara (*subscribe*) **hanya** pada bagian state yang benar-benar dibutuhkan.

```typescript
function App() {
  // 1. Ambil State Menggunakan Selector
  const todoList = useStore((state) => state.todos);
  const statusFilter = useStore((state) => state.statusFilter);
  const sortOrder = useStore((state) => state.sortOrder);

  // 2. Ambil Semua Actions Menggunakan Selector
  const create = useStore((state) => state.createTodo);
  const remove = useStore((state) => state.removeTodo);
  const check = useStore((state) => state.checkTodo);
  const edit = useStore((state) => state.editTodo);
  const removeAll = useStore((state) => state.removeAll);
  const setStatusFilter = useStore((state) => state.setStatusFilter);
  const setSortOrder = useStore((state) => state.setSortOrder);

  // ... logik komponen
}
```

> 💡 **Tips Performa**: Jangan pernah memanggil `const store = useStore()` tanpa selector jika Anda hanya butuh satu field. Memanggil tanpa selector akan membuat komponen re-render setiap kali **ada perubahan sekecil apa pun** pada store global!

### Contoh Penggunaan Action pada Form & Event Handlers:

```typescript
const [value, setValue] = useState<string>("");

// 1. Memanggil Action createTodo
function handleCreate() {
  if (value.trim() !== "") {
    create({
      id: crypto.randomUUID(),
      task: value,
      isComplete: false,
      isEdit: false,
    });
    setValue("");
  }
}

// 2. Memanggil Action checkTodo & editTodo pada UI
<Checkbox onCheckedChange={() => check(todo.id)} checked={todo.isComplete} />

<Button onClick={() => edit(todo.id, todo.task)}>Edit</Button>

// 3. Memanggil Action removeTodo
<Button onClick={() => remove(todo.id)}>Delete</Button>

// 4. Memanggil Action setStatusFilter & setSortOrder
<Button onClick={() => setStatusFilter("active")}>Aktif</Button>
<Button onClick={() => setSortOrder("asc")}>A-Z</Button>
```

---

## 9. Rangkuman Best Practices

1. **Selalu Gunakan Selectors**: Ambil nilai state secara spesifik (`useStore(s => s.field)`).
2. **Pakai Slice Pattern untuk Proyek Menengah - Besar**: Pisahkan logika state ke file slice tersendiri.
3. **Gunakan Middleware Sesuai Kebutuhan**:
   - `immer` untuk manipulasi struktur nested / array yang kompleks.
   - `persist` untuk penyimpanan permanen (LocalStorage / SessionStorage).
4. **Gunakan TypeScript Secara Ketat**: Definisikan tipe `StateCreator` agar autocomplete dan type checking berfungsi optimal saat mendefinisikan slice.
5. **Hindari Menggunakan Provider**: Zustand tidak memerlukan React Provider Wrapper di `main.tsx` atau `App.tsx`, menjadikannya sangat bersih dan mudah dites.

---
*Dokumen ini dibuat secara otomatis sebagai materi edukasi berbasis proyek React Todo List.*
