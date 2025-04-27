import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export function useLayerTracking(stepId?: string, lineId?: string) {
  const [layers, setLayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let socket: any;
    let isMounted = true;
    
    // Function to fetch layers
    const fetchLayers = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      try {
        let url = '/api/layers?';
        if (stepId) url += `stepId=${stepId}&`;
        if (lineId) url += `lineId=${lineId}&`;
        url += 'status=in-progress'; // Only get in-progress layers
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch layers');
        
        const data = await response.json();
        if (isMounted) {
          setLayers(data.layers || []);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching layers:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Initialize socket connection
    const initSocket = async () => {
      // Make sure socket server is initialized
      await fetch('/api/socketio');
      
      // Connect to socket server
      socket = io({
        path: '/api/socketio',
      });
      
      // Subscribe to relevant rooms
      const rooms:any = [];
      if (stepId) rooms.push(`step:${stepId}`);
      if (lineId) rooms.push(`line:${lineId}`);
      
      socket.on('connect', () => {
        console.log('Socket connected');
        if (rooms.length > 0) {
          socket.emit('subscribe', rooms);
        }
      });
      
      // Handle layer updates
      socket.on('layer:update', (updatedLayer: any) => {
        if (!isMounted) return;
        
        setLayers(prevLayers => {
          // Check if this layer is already in our list
          const index = prevLayers.findIndex(l => l._id === updatedLayer._id);
          
          if (index >= 0) {
            // Update existing layer
            const newLayers = [...prevLayers];
            newLayers[index] = updatedLayer;
            return newLayers;
          } else {
            // Add new layer if it matches our criteria
            const isInCurrentStep = updatedLayer.currentStep?.stepId?._id === stepId;
            const isInCurrentLine = updatedLayer.productionLineId?._id === lineId;
            
            if ((stepId && isInCurrentStep) || (lineId && isInCurrentLine)) {
              return [...prevLayers, updatedLayer];
            }
            return prevLayers;
          }
        });
      });
      
      // Handle layer completion
      socket.on('layer:complete', (layerId: string) => {
        if (!isMounted) return;
        
        setLayers(prevLayers => prevLayers.filter(l => l._id !== layerId));
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      
      socket.on('error', (err: any) => {
        console.error('Socket error:', err);
      });
    };
    
    // Initialize
    fetchLayers();
    initSocket();
    
    // Set up periodic refresh (as a fallback)
    const intervalId = setInterval(fetchLayers, 30000); // Refresh every 30 seconds
    
    // Cleanup
    return () => {
      isMounted = false;
      clearInterval(intervalId);
      
      if (socket) {
        const rooms = [];
        if (stepId) rooms.push(`step:${stepId}`);
        if (lineId) rooms.push(`line:${lineId}`);
        
        if (rooms.length > 0) {
          socket.emit('unsubscribe', rooms);
        }
        
        socket.disconnect();
      }
    };
  }, [stepId, lineId]);
  
  return { layers, isLoading, error };
}
