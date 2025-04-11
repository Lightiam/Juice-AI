
const DB_NAME = 'JuiceAIDB';
const DB_VERSION = 1;
const STORES = {
  CONTACTS: 'contacts',
  CONTACT_LISTS: 'contactLists',
  CAMPAIGNS: 'campaigns',
  USER: 'user'
};

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject('Error opening database');
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(STORES.CONTACTS)) {
        const contactsStore = db.createObjectStore(STORES.CONTACTS, { keyPath: 'id', autoIncrement: true });
        contactsStore.createIndex('type', 'type', { unique: false });
        contactsStore.createIndex('value', 'value', { unique: false });
        contactsStore.createIndex('source', 'source', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.CONTACT_LISTS)) {
        const listsStore = db.createObjectStore(STORES.CONTACT_LISTS, { keyPath: 'id', autoIncrement: true });
        listsStore.createIndex('name', 'name', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.CAMPAIGNS)) {
        const campaignsStore = db.createObjectStore(STORES.CAMPAIGNS, { keyPath: 'id', autoIncrement: true });
        campaignsStore.createIndex('name', 'name', { unique: false });
        campaignsStore.createIndex('status', 'status', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.USER)) {
        db.createObjectStore(STORES.USER, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const addItem = (storeName, item) => {
  return new Promise((resolve, reject) => {
    initDB().then(db => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);
      
      request.onsuccess = (event) => {
        resolve({ ...item, id: event.target.result });
      };
      
      request.onerror = (event) => {
        console.error(`Error adding item to ${storeName}:`, event.target.error);
        reject(event.target.error);
      };
    }).catch(error => reject(error));
  });
};

export const getAllItems = (storeName) => {
  return new Promise((resolve, reject) => {
    initDB().then(db => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error(`Error getting items from ${storeName}:`, event.target.error);
        reject(event.target.error);
      };
    }).catch(error => reject(error));
  });
};

export const getItemById = (storeName, id) => {
  return new Promise((resolve, reject) => {
    initDB().then(db => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        console.error(`Error getting item from ${storeName}:`, event.target.error);
        reject(event.target.error);
      };
    }).catch(error => reject(error));
  });
};

export const updateItem = (storeName, item) => {
  return new Promise((resolve, reject) => {
    initDB().then(db => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      
      request.onsuccess = () => {
        resolve(item);
      };
      
      request.onerror = (event) => {
        console.error(`Error updating item in ${storeName}:`, event.target.error);
        reject(event.target.error);
      };
    }).catch(error => reject(error));
  });
};

export const deleteItem = (storeName, id) => {
  return new Promise((resolve, reject) => {
    initDB().then(db => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = (event) => {
        console.error(`Error deleting item from ${storeName}:`, event.target.error);
        reject(event.target.error);
      };
    }).catch(error => reject(error));
  });
};

export const addContact = (contact) => {
  return addItem(STORES.CONTACTS, {
    ...contact,
    createdAt: new Date().toISOString()
  });
};

export const getContacts = () => {
  return getAllItems(STORES.CONTACTS);
};

export const updateContact = (contact) => {
  return updateItem(STORES.CONTACTS, {
    ...contact,
    updatedAt: new Date().toISOString()
  });
};

export const deleteContact = (id) => {
  return deleteItem(STORES.CONTACTS, id);
};

export const addContactList = (list) => {
  return addItem(STORES.CONTACT_LISTS, {
    ...list,
    createdAt: new Date().toISOString()
  });
};

export const getContactLists = () => {
  return getAllItems(STORES.CONTACT_LISTS);
};

export const getContactListById = (id) => {
  return getItemById(STORES.CONTACT_LISTS, id);
};

export const updateContactList = (list) => {
  return updateItem(STORES.CONTACT_LISTS, {
    ...list,
    updatedAt: new Date().toISOString()
  });
};

export const deleteContactList = (id) => {
  return deleteItem(STORES.CONTACT_LISTS, id);
};

export const addCampaign = (campaign) => {
  return addItem(STORES.CAMPAIGNS, {
    ...campaign,
    createdAt: new Date().toISOString(),
    status: campaign.status || 'draft'
  });
};

export const getCampaigns = () => {
  return getAllItems(STORES.CAMPAIGNS);
};

export const getCampaignById = (id) => {
  return getItemById(STORES.CAMPAIGNS, id);
};

export const updateCampaign = (campaign) => {
  return updateItem(STORES.CAMPAIGNS, {
    ...campaign,
    updatedAt: new Date().toISOString()
  });
};

export const deleteCampaign = (id) => {
  return deleteItem(STORES.CAMPAIGNS, id);
};

export const saveUser = (user) => {
  return updateItem(STORES.USER, {
    id: 1, // We only store one user
    ...user,
    updatedAt: new Date().toISOString()
  });
};

export const getUser = () => {
  return getItemById(STORES.USER, 1);
};
