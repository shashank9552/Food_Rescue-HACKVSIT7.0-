import { create } from 'zustand';
import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

// Initialize socket
export const socket = io(BACKEND_URL, {
  autoConnect: true,
  transports: ['websocket'],
});

const initialMockItems = [
  {
    id: 'res-1',
    name: 'Spaghetti Bolognese (15 Portions)',
    restaurantName: 'La Piazza Trattoria',
    address: '456 Olive Way, Foodville',
    status: 'posted', // posted, claimed, picked_up, delivered
    ngoName: null,
    volunteerName: null,
    timestamp: '2026-07-24T10:30:00.000Z',
    description: 'Freshly prepared, stored in hygienic aluminum trays. Ready for pickup immediately.',
  },
  {
    id: 'res-2',
    name: 'Assorted Gourmet Sandwiches (20 Boxes)',
    restaurantName: 'Downtown Deli & Cafe',
    address: '789 Broadway St, Foodville',
    status: 'claimed',
    ngoName: 'Second Harvest Food Bank',
    volunteerName: null,
    timestamp: '2026-07-24T11:15:00.000Z',
    description: 'Vegetarian and turkey options. Separately packaged with allergen labels.',
  },
  {
    id: 'res-3',
    name: 'Organic Salad Bowls (10 Packs)',
    restaurantName: 'Green & Lean Kitchen',
    address: '101 Wellness Blvd, Foodville',
    status: 'picked_up',
    ngoName: 'Hope Shelter',
    volunteerName: 'Alex Mercer',
    timestamp: '2026-07-24T09:45:00.000Z',
    description: 'Fresh green salads with light vinaigrette dressing. Keep chilled.',
  },
  {
    id: 'res-4',
    name: 'Bakers Choice Pastry Assortment (30 Pcs)',
    restaurantName: 'Sweet Treats Bakery',
    address: '12 Bakery Lane, Foodville',
    status: 'delivered',
    ngoName: 'Community Kitchen East',
    volunteerName: 'Sarah Jenkins',
    timestamp: '2026-07-24T08:00:00.000Z',
    description: 'Muffins, croissants, and danishes. Safely sealed in paper bags.',
  }
];

export const useStore = create((set) => ({
  userRole: null, // restaurant, ngo, volunteer, admin
  userName: '',
  rescueItems: initialMockItems,
  socketConnected: false,

  setRole: (role) => set({ userRole: role }),
  setUserName: (name) => set({ userName: name }),
  
  // Set up socket event listeners
  initSocket: () => {
    socket.on('connect', () => {
      set({ socketConnected: true });
      console.log('Connected to socket.io server');
    });

    socket.on('disconnect', () => {
      set({ socketConnected: false });
      console.log('Disconnected from socket.io server');
    });

    // Listen for rescue item updates from backend
    socket.on('rescue_items_update', (items) => {
      set({ rescueItems: items });
    });

    socket.on('new_rescue_item', (newItem) => {
      set((state) => ({
        rescueItems: [newItem, ...state.rescueItems],
      }));
    });

    socket.on('rescue_item_updated', (updatedItem) => {
      set((state) => ({
        rescueItems: state.rescueItems.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        ),
      }));
    });
  },

  // Actions that call mock local state OR emit to backend socket
  addRescueItem: (itemData) => {
    const newItem = {
      id: `res-${Date.now()}`,
      ...itemData,
      status: 'posted',
      ngoName: null,
      volunteerName: null,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      rescueItems: [newItem, ...state.rescueItems],
    }));

    // Emit event if socket is connected
    socket.emit('create_rescue_item', newItem);
  },

  claimRescueItem: (itemId, ngoName) => {
    set((state) => ({
      rescueItems: state.rescueItems.map((item) =>
        item.id === itemId
          ? { ...item, status: 'claimed', ngoName }
          : item
      ),
    }));

    socket.emit('update_rescue_item_status', { itemId, status: 'claimed', ngoName });
  },

  pickupRescueItem: (itemId, volunteerName) => {
    set((state) => ({
      rescueItems: state.rescueItems.map((item) =>
        item.id === itemId
          ? { ...item, status: 'picked_up', volunteerName }
          : item
      ),
    }));

    socket.emit('update_rescue_item_status', { itemId, status: 'picked_up', volunteerName });
  },

  deliverRescueItem: (itemId) => {
    set((state) => ({
      rescueItems: state.rescueItems.map((item) =>
        item.id === itemId
          ? { ...item, status: 'delivered' }
          : item
      ),
    }));

    socket.emit('update_rescue_item_status', { itemId, status: 'delivered' });
  },

  setRescueItems: (items) => set({ rescueItems: items }),
}));
