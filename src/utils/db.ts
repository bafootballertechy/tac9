// --- Constants ---

const dbName = "TacstemVideosDB";
const storeName = "videos";
const projectStoreName = "projects";
const handlesStoreName = "handles";
const batchStoreName = "batches";
const boardProjectStoreName = "board_projects";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 6);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
      if (!db.objectStoreNames.contains(projectStoreName)) {
        db.createObjectStore(projectStoreName);
      }
      if (!db.objectStoreNames.contains(handlesStoreName)) {
        db.createObjectStore(handlesStoreName);
      }
      if (!db.objectStoreNames.contains(batchStoreName)) {
        db.createObjectStore(batchStoreName);
      }
      if (!db.objectStoreNames.contains(boardProjectStoreName)) {
        db.createObjectStore(boardProjectStoreName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveFileHandle = async (projectId: string, handle: any) => {
  try {
      const db = await openDB();
      return new Promise<void>((resolve, reject) => {
          const tx = db.transaction(handlesStoreName, "readwrite");
          const store = tx.objectStore(handlesStoreName);
          store.put(handle, projectId);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
      });
  } catch (e) {
      console.error("Local save error:", e);
  }
};

export const loadFileHandle = async (projectId: string): Promise<any | null> => {
  try {
      const db = await openDB();
      return new Promise<any | null>((resolve, reject) => {
          const tx = db.transaction(handlesStoreName, "readonly");
          const store = tx.objectStore(handlesStoreName);
          const request = store.get(projectId);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error);
      });
  } catch {
      return null;
  }
};

export const saveVideoLocally = async (id: string, file: File) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const loadVideoLocally = async (id: string): Promise<File | null> => {
    try {
        const db = await openDB();
        return new Promise<File | null>((resolve, reject) => {
            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch {
        return null;
    }
};

export const saveProjectDataLocally = async (id: string, data: any) => {
    try {
        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(projectStoreName, "readwrite");
            const store = tx.objectStore(projectStoreName);
            store.put(data, id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.error("Local save error:", e);
    }
};

export const listProjectsLocally = async (): Promise<any[]> => {
    try {
        const db = await openDB();
        return new Promise<any[]>((resolve, reject) => {
            const tx = db.transaction(projectStoreName, "readonly");
            const store = tx.objectStore(projectStoreName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    } catch {
        return [];
    }
};

export const deleteProjectLocally = async (id: string) => {
    try {
        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction([projectStoreName, storeName, handlesStoreName], "readwrite");
            tx.objectStore(projectStoreName).delete(id);
            tx.objectStore(storeName).delete(id);
            tx.objectStore(handlesStoreName).delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.error("Local delete error:", e);
    }
};

export const saveBatchLocally = async (batch: any) => {
    try {
        // Also persist in localStorage for instant fallback
        const existingRaw = localStorage.getItem('tacstem_batches');
        let batchesList = existingRaw ? JSON.parse(existingRaw) : [];
        const idx = batchesList.findIndex((b: any) => b.id === batch.id);
        if (idx >= 0) {
            batchesList[idx] = batch;
        } else {
            batchesList.push(batch);
        }
        localStorage.setItem('tacstem_batches', JSON.stringify(batchesList));

        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(batchStoreName, "readwrite");
            const store = tx.objectStore(batchStoreName);
            store.put(batch, batch.id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.warn("Local batch save error:", e);
    }
};

export const listBatchesLocally = async (): Promise<any[]> => {
    try {
        const db = await openDB();
        const idbBatches = await new Promise<any[]>((resolve, reject) => {
            const tx = db.transaction(batchStoreName, "readonly");
            const store = tx.objectStore(batchStoreName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });

        if (idbBatches && idbBatches.length > 0) {
            return idbBatches;
        }
    } catch {
        // Fallback to localStorage
    }

    try {
        const raw = localStorage.getItem('tacstem_batches');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const deleteBatchLocally = async (id: string) => {
    try {
        const existingRaw = localStorage.getItem('tacstem_batches');
        if (existingRaw) {
            const batchesList = JSON.parse(existingRaw).filter((b: any) => b.id !== id);
            localStorage.setItem('tacstem_batches', JSON.stringify(batchesList));
        }

        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(batchStoreName, "readwrite");
            tx.objectStore(batchStoreName).delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.warn("Local batch delete error:", e);
    }
};

// --- Tactical Board Projects Storage ---

export const saveBoardProjectLocally = async (boardProject: any) => {
    try {
        const existingRaw = localStorage.getItem('tacstem_board_projects');
        let projectsList = existingRaw ? JSON.parse(existingRaw) : [];
        const idx = projectsList.findIndex((p: any) => p.id === boardProject.id);
        if (idx >= 0) {
            projectsList[idx] = boardProject;
        } else {
            projectsList.push(boardProject);
        }
        localStorage.setItem('tacstem_board_projects', JSON.stringify(projectsList));

        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(boardProjectStoreName, "readwrite");
            const store = tx.objectStore(boardProjectStoreName);
            store.put(boardProject, boardProject.id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.warn("Local board project save error:", e);
    }
};

export const listBoardProjectsLocally = async (): Promise<any[]> => {
    try {
        const db = await openDB();
        const idbProjects = await new Promise<any[]>((resolve, reject) => {
            const tx = db.transaction(boardProjectStoreName, "readonly");
            const store = tx.objectStore(boardProjectStoreName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });

        if (idbProjects && idbProjects.length > 0) {
            return idbProjects;
        }
    } catch {
        // Fallback to localStorage
    }

    try {
        const raw = localStorage.getItem('tacstem_board_projects');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const getBoardProjectLocally = async (id: string): Promise<any | null> => {
    try {
        const db = await openDB();
        const project = await new Promise<any | null>((resolve, reject) => {
            const tx = db.transaction(boardProjectStoreName, "readonly");
            const store = tx.objectStore(boardProjectStoreName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });

        if (project) return project;
    } catch {
        // Fallback
    }

    try {
        const raw = localStorage.getItem('tacstem_board_projects');
        if (raw) {
            const list = JSON.parse(raw);
            return list.find((p: any) => p.id === id) || null;
        }
    } catch {
        // ignore
    }
    return null;
};

export const deleteBoardProjectLocally = async (id: string) => {
    try {
        const existingRaw = localStorage.getItem('tacstem_board_projects');
        if (existingRaw) {
            const projectsList = JSON.parse(existingRaw).filter((p: any) => p.id !== id);
            localStorage.setItem('tacstem_board_projects', JSON.stringify(projectsList));
        }

        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(boardProjectStoreName, "readwrite");
            tx.objectStore(boardProjectStoreName).delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.warn("Local board project delete error:", e);
    }
};


