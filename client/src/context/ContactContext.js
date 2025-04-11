import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as db from '../utils/indexedDB';

const initialState = {
  contacts: [],
  contactLists: [],
  loading: false,
  error: null
};

const ContactContext = createContext(initialState);

const FETCH_CONTACTS_REQUEST = 'FETCH_CONTACTS_REQUEST';
const FETCH_CONTACTS_SUCCESS = 'FETCH_CONTACTS_SUCCESS';
const FETCH_CONTACTS_FAILURE = 'FETCH_CONTACTS_FAILURE';
const FETCH_LISTS_SUCCESS = 'FETCH_LISTS_SUCCESS';
const ADD_CONTACTS_SUCCESS = 'ADD_CONTACTS_SUCCESS';
const ADD_LIST_SUCCESS = 'ADD_LIST_SUCCESS';
const UPDATE_LIST_SUCCESS = 'UPDATE_LIST_SUCCESS';

const contactReducer = (state, action) => {
  switch (action.type) {
    case FETCH_CONTACTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case FETCH_CONTACTS_SUCCESS:
      return {
        ...state,
        loading: false,
        contacts: action.payload
      };
    case FETCH_LISTS_SUCCESS:
      return {
        ...state,
        loading: false,
        contactLists: action.payload
      };
    case FETCH_CONTACTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case ADD_CONTACTS_SUCCESS:
      return {
        ...state,
        contacts: [...state.contacts, ...action.payload],
        loading: false
      };
    case ADD_LIST_SUCCESS:
      return {
        ...state,
        contactLists: [...state.contactLists, action.payload],
        loading: false
      };
    case UPDATE_LIST_SUCCESS:
      return {
        ...state,
        contactLists: state.contactLists.map(list => 
          list.id === action.payload.id ? action.payload : list
        ),
        loading: false
      };
    default:
      return state;
  }
};

export const ContactProvider = ({ children }) => {
  const [state, dispatch] = useReducer(contactReducer, initialState);

  useEffect(() => {
    fetchContacts();
    fetchContactLists();
  }, []);

  const fetchContacts = async () => {
    dispatch({ type: FETCH_CONTACTS_REQUEST });
    try {
      const contacts = await db.getContacts();
      dispatch({ 
        type: FETCH_CONTACTS_SUCCESS,
        payload: contacts 
      });
    } catch (error) {
      dispatch({ 
        type: FETCH_CONTACTS_FAILURE,
        payload: error.message
      });
    }
  };

  const fetchContactLists = async () => {
    dispatch({ type: FETCH_CONTACTS_REQUEST });
    try {
      const lists = await db.getContactLists();
      dispatch({ 
        type: FETCH_LISTS_SUCCESS,
        payload: lists 
      });
    } catch (error) {
      dispatch({ 
        type: FETCH_CONTACTS_FAILURE,
        payload: error.message
      });
    }
  };

  const addContacts = async (contacts) => {
    dispatch({ type: FETCH_CONTACTS_REQUEST });
    try {
      const savedContacts = [];
      for (const contact of contacts) {
        const savedContact = await db.addContact(contact);
        savedContacts.push(savedContact);
      }
      dispatch({ 
        type: ADD_CONTACTS_SUCCESS,
        payload: savedContacts 
      });
      return savedContacts;
    } catch (error) {
      dispatch({ 
        type: FETCH_CONTACTS_FAILURE,
        payload: error.message
      });
      return [];
    }
  };

  const createContactList = async (name, contactIds = []) => {
    dispatch({ type: FETCH_CONTACTS_REQUEST });
    try {
      const newList = await db.addContactList({
        name,
        contacts: contactIds
      });
      dispatch({ 
        type: ADD_LIST_SUCCESS,
        payload: newList 
      });
      return newList;
    } catch (error) {
      dispatch({ 
        type: FETCH_CONTACTS_FAILURE,
        payload: error.message
      });
      return null;
    }
  };

  const addContactsToList = async (listId, contactIds) => {
    dispatch({ type: FETCH_CONTACTS_REQUEST });
    try {
      const list = await db.getContactListById(listId);
      if (!list) throw new Error('Contact list not found');
      
      const updatedContactIds = [...new Set([...list.contacts || [], ...contactIds])];
      
      const updatedList = {
        ...list,
        contacts: updatedContactIds
      };
      
      const result = await db.updateContactList(updatedList);
      
      dispatch({ 
        type: UPDATE_LIST_SUCCESS,
        payload: result 
      });
      
      return result;
    } catch (error) {
      dispatch({ 
        type: FETCH_CONTACTS_FAILURE,
        payload: error.message
      });
      return null;
    }
  };

  return (
    <ContactContext.Provider
      value={{
        ...state,
        fetchContacts,
        fetchContactLists,
        addContacts,
        createContactList,
        addContactsToList
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => useContext(ContactContext);
