import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as db from '../utils/indexedDB';

const initialState = {
  campaigns: [],
  loading: false,
  error: null
};

const CampaignContext = createContext(initialState);

const FETCH_CAMPAIGNS_REQUEST = 'FETCH_CAMPAIGNS_REQUEST';
const FETCH_CAMPAIGNS_SUCCESS = 'FETCH_CAMPAIGNS_SUCCESS';
const FETCH_CAMPAIGNS_FAILURE = 'FETCH_CAMPAIGNS_FAILURE';
const ADD_CAMPAIGN_SUCCESS = 'ADD_CAMPAIGN_SUCCESS';
const UPDATE_CAMPAIGN_SUCCESS = 'UPDATE_CAMPAIGN_SUCCESS';

const campaignReducer = (state, action) => {
  switch (action.type) {
    case FETCH_CAMPAIGNS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case FETCH_CAMPAIGNS_SUCCESS:
      return {
        ...state,
        loading: false,
        campaigns: action.payload
      };
    case FETCH_CAMPAIGNS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case ADD_CAMPAIGN_SUCCESS:
      return {
        ...state,
        campaigns: [...state.campaigns, action.payload],
        loading: false
      };
    case UPDATE_CAMPAIGN_SUCCESS:
      return {
        ...state,
        campaigns: state.campaigns.map(campaign => 
          campaign.id === action.payload.id ? action.payload : campaign
        ),
        loading: false
      };
    default:
      return state;
  }
};

export const CampaignProvider = ({ children }) => {
  const [state, dispatch] = useReducer(campaignReducer, initialState);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    dispatch({ type: FETCH_CAMPAIGNS_REQUEST });
    try {
      const campaigns = await db.getCampaigns();
      dispatch({ 
        type: FETCH_CAMPAIGNS_SUCCESS,
        payload: campaigns 
      });
    } catch (error) {
      dispatch({ 
        type: FETCH_CAMPAIGNS_FAILURE,
        payload: error.message
      });
    }
  };

  const createCampaign = async (campaignData) => {
    dispatch({ type: FETCH_CAMPAIGNS_REQUEST });
    try {
      const newCampaign = await db.addCampaign(campaignData);
      dispatch({ 
        type: ADD_CAMPAIGN_SUCCESS,
        payload: newCampaign 
      });
      return newCampaign;
    } catch (error) {
      dispatch({ 
        type: FETCH_CAMPAIGNS_FAILURE,
        payload: error.message
      });
      return null;
    }
  };

  const updateCampaign = async (campaignData) => {
    dispatch({ type: FETCH_CAMPAIGNS_REQUEST });
    try {
      const updatedCampaign = await db.updateCampaign(campaignData);
      dispatch({ 
        type: UPDATE_CAMPAIGN_SUCCESS,
        payload: updatedCampaign 
      });
      return updatedCampaign;
    } catch (error) {
      dispatch({ 
        type: FETCH_CAMPAIGNS_FAILURE,
        payload: error.message
      });
      return null;
    }
  };

  const scheduleCampaign = async (id, scheduledDate) => {
    dispatch({ type: FETCH_CAMPAIGNS_REQUEST });
    try {
      const campaign = await db.getCampaignById(id);
      if (!campaign) throw new Error('Campaign not found');
      
      const updatedCampaign = {
        ...campaign,
        status: 'scheduled',
        scheduledDate
      };
      
      const result = await db.updateCampaign(updatedCampaign);
      
      dispatch({ 
        type: UPDATE_CAMPAIGN_SUCCESS,
        payload: result 
      });
      
      return result;
    } catch (error) {
      dispatch({ 
        type: FETCH_CAMPAIGNS_FAILURE,
        payload: error.message
      });
      return null;
    }
  };

  return (
    <CampaignContext.Provider
      value={{
        ...state,
        fetchCampaigns,
        createCampaign,
        updateCampaign,
        scheduleCampaign
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => useContext(CampaignContext);
