import { Audio } from 'expo-av';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet , TouchableOpacity, ActivityIndicator} from 'react-native';
import io from 'socket.io-client';
import * as Notifications from 'expo-notifications';
import { BackHandler, Alert, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';

const ITEMS_PER_PAGE = 6;

const Main_Screen = ({ route, navigation }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState('all');
  const [isSuccessfulRequest, setIsSuccessfulRequest] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); // State to track loading status
  const [temperature, setTemperature] = useState('36.1');
  const [temperatureTime, setTemperatureTime] = useState('05.40');
  const [notificationStatus, setNotificationStatus] = useState('');
  const [playableFlag, setPlayableFlag] = useState(1);
  const [firstDownload, setFirstDownload] = useState(0);
  const [picture, setPicture] = useState('awake'); // Default picture
  const [latestCryId, setLatestCryId] = useState(null);
  let loaded = 0;
  let dataObj;
  
  


  async function registerForPushNotificationsAsync() {
    let token;
    
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      //token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    
    /*
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
   */
    return token;
  }
  
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);
  
 
  const getPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
    return status === 'granted';
  };
  
//  const downloadAndPlayAudio2 = async (audioUrl) => {
//    const uri = FileSystem.documentDirectory + 'downloadedAudio.wav';
//    console.log(FileSystem.documentDirectory);
//    console.log("Attempting to download from URL:", audioUrl);
//
//    timeout(1000, FileSystem.downloadAsync(audioUrl, uri))
//        .then(downloadResult => {
//            console.log('Download Result:', downloadResult);
//            if (downloadResult.status === 200) {
//                console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
//                console.log('Download successful:', downloadResult.uri);
//                playAudio(uri);
//                // Here you could invoke further actions, like playing the audio
//            } else {
//                console.error('Failed to download file:', downloadResult.status);
//            }
//        })
//        .catch(error => {
//            console.error('An error occurred while downloading the file:', error);
//        });
//};

const downloadAndPlayAudio2 = async (audioUrl, retryCount = 0) => {
  const uri = FileSystem.documentDirectory + 'downloadedAudio.wav';
  console.log("Attempting to download from URL:", audioUrl);

  try {
      const downloadResult = await timeout(1000, FileSystem.downloadAsync(audioUrl, uri));
      console.log('Download Result:', downloadResult);
      
      if (downloadResult.status === 200) {
          console.log('Download successful:', downloadResult.uri);
          setPlayableFlag(1);
          setFirstDownload(1);
          
      } else {
          console.error('Failed to download file:', downloadResult.status);
      }
  } catch (error) {
      if (retryCount < 20) {
          console.log(`Attempt ${retryCount + 1}: Retrying download...`);
          await downloadAndPlayAudio2(audioUrl, retryCount + 1);
      } else {
          console.error('An error occurred after retries:', error);
      }
  }
};

function timeout(ms, promise) {
  return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
          reject(new Error("Promise timed out after " + ms + " ms"));
      }, ms);

      promise.then(
          (value) => {
              clearTimeout(timer);
              resolve(value);
          },
          (reason) => {
              clearTimeout(timer);
              reject(reason);
          }
      );
  });
}
  const downloadAndPlayAudio = async (audioUrl) => {
    
    
    console.log("dpaa trigger");

    try {
        console.log("dpaa cp2");
        const uri = FileSystem.documentDirectory + 'downloadedAudio.wav';

        const downloadResult = await timeout(10000,FileSystem.downloadAsync(audioUrl, uri));
        console.log("@@@@@@@@@@@@@@@@@@");
        if (downloadResult.status === 200) {
          console.log('Download successful: ', downloadResult.uri);
          // Do something with the downloaded file
        } else {
          console.error('Failed to download file:', downloadResult.status);
        }
      } catch (error) {
        console.error('An error occurred while downloading the file:', error);
      }
    

};
let addr = 'file:///data/user/0/host.exp.exponent/files/downloadedAudio.wav';
const requestLocationPermission = async () => {
  // Requesting foreground location permission
  let { status } = await Location.requestForegroundPermissionsAsync();
  console.log(status);
}; 

 const playAudio = async (uri) => {
   // Assuming you have set up expo-av to play audio
   const { Sound } = require('expo-av');
   console.log("SoundPlay cp1");
   const { sound } = await Audio.Sound.createAsync({ uri });
   console.log("SoundPlay cp2");
   await sound.playAsync();
   console.log("SoundPlay cp3");
 };

  const sendLocalNotification = async (notificationStatus) => {
    if (notificationStatus === "cry") {
      await Notifications.scheduleNotificationAsync({

      
        content: {
          title: "Your baby might be crying 😭",
          body: 'You better go check!',
          data: { withSome: 'data' },
          vibrate: [0, 500, 200, 500],
        },
        trigger: null, // This means the notification will be sent immediately.
        identifier: 'unique-notification-id'
      });
    }
    else if (notificationStatus === "awake") {
      await Notifications.scheduleNotificationAsync({
      
      
        content: {
          title: "Your baby has awaken!",
          body: 'You might want to go check!',
          data: { withSome: 'data' },
          vibrate: [0, 500, 200, 500],
        },
        trigger: null, // This means the notification will be sent immediately.
        identifier: 'unique-notification-id'
      });
    }
    
    else if (notificationStatus === "body move"){
      await Notifications.scheduleNotificationAsync({
      
        

        content: {
          title: "Your baby has moved a lot!",
          body: 'You better go check!',
          data: { withSome: 'data' },
          vibrate: [0, 500, 200, 500],
        },
        trigger: null, // This means the notification will be sent immediately.
        identifier: 'unique-notification-id'
      });
    
    }

    else if (notificationStatus === "temperature rise"){
      await Notifications.scheduleNotificationAsync({
      
        

        content: {
          title: "Temperature gone high 🌡",
          body: 'You better go check!',
          data: { withSome: 'data' },
          vibrate: [0, 500, 200, 500],
        },
        trigger: null, // This means the notification will be sent immediately.
        identifier: 'unique-notification-id'
      });
    
    }

    else{

        console.log("a situation where no notification should be sent.")
    }

    
  };

  useEffect(() => {
    registerForPushNotificationsAsync();
  
    // When the app is in the foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
    });
  
    // When the user interacts with the notification (e.g., taps on it)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Response Received:', response);
    });
  
    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const triggerLocalNotificationHandler = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: 'Here is the notification body',
        data: { data: 'goes here' },
      },
      trigger: null, // null means the notification will be sent immediately
    });
  };

 

  useEffect(() => {
    
    const socket = io('http://192.168.57.119:4999', {
      transports: ['websocket'], // Use WebSocket transport
    });
    
    if (route.params?.justLoggedIn) {
      socket.connect();
      filterData();
        // Optionally remove the parameter if it's a one-time action
      navigation.setParams({ justLoggedIn: undefined });
    }
    
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      
      print(loaded)
    });
    
    // Listen for the 'new_data' event
    socket.on('notification', (message) => {
      console.log('New data received:', message);
      console.log(message.label);
      console.log(playableFlag);
      dataObj = message;
      console.log(dataObj.url);
      if  (dataObj.label === "cry"){
        setPlayableFlag(0);
        downloadAndPlayAudio2(dataObj.url);
        console.log("downloaded hopefully");
        setData((prevData) => [...prevData, dataObj]);
      }

      else if (dataObj.label === 'temperature'){
        console.log("we're here");
        setTemperature(dataObj.temp);
        
        let qwe = dataObj.time.slice(-8, -3);
        //downloadAndPlayAudio2(dataObj.url);
        setTemperatureTime(qwe);
        
      }

      else {
        setData((prevData) => [...prevData, dataObj]);
        
        setPictureBasedOnLabel(dataObj);

        
        setLoading(false);
      };
      
      

      sendLocalNotification(message.label).then(() => {
        console.log('Reminder set and notification sent!');
      }).catch(error => {
        console.error('Error sending notification:', error);
      });
      
       // Data received, set loading to false
      
      // Here you can handle the received data
    });

    socket.on('initial', (message) => {
      console.log('New data received:', message);
      
      dataObj = message
      console.log(dataObj.label);
      
      
      setData(dataObj);
      

      setLoading(false); // Data received, set loading to false
      
      // Here you can handle the received data
    });
  
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  
    // Cleanup on component unmount
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    filterData();
    
  }, [selectedLabel,data, picture]);

  useEffect(() => {
    const lastCryIndex = data.reduce((acc, item, index) => item.label === 'cry' ? index : acc, -1);
    setLatestCryId(lastCryIndex);
    console.log("cryid");
    console.log(lastCryIndex);
   
    
  }, [data]);


  
  const setPictureBasedOnLabel = (dataObj) => {
    if (dataObj.label === 'sleep' || dataObj.label === 'awake') {
        // Define logic to determine which picture to use
        let newPicture = '';
        if (dataObj.label === 'sleep') {
            newPicture = 'sleep'; // Assuming you have an image for sleep
        } else if (dataObj.label === 'awake') {
            newPicture = 'awake'; // Assuming you have an image for awake
        }

        // Update the picture state
        setPicture(newPicture);
        filterData();
    }
    
    
};


  const handleLoadMore = () => {
    // Load more data when the user scrolls to the end, and the request was successful
    if (isSuccessfulRequest) {
      setCurrentPage((prevPage) => prevPage);
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  

  const itemsForCurrentPage = filteredData
  .slice()
  .reverse()
  .slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  useEffect(() => {
    const backAction = () => {
      // Check if there's a specific condition to handle or just go back
      
        navigation.goBack(); // Use the navigation prop to go back
        return true;  // Return true to indicate that you've handled the event
      
    };

    // Add event listener for hardware back press
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    // Clean up the event listener when the component unmounts
    return () => backHandler.remove();
  }, []);
  

  const filterData = () => {
    if (selectedLabel === 'all') {
      setFilteredData(data);
    
    } else if (selectedLabel === 'mama/papa'){
      setFilteredData(data.filter(item => item.label === 'mama' || item.label === 'papa'));
    } else if (selectedLabel === 'sleep/awake'){
      setFilteredData(data.filter(item => item.label === 'sleep' || item.label === 'awake'));
    }
    
    else {
      setFilteredData(data.filter(item => item.label === selectedLabel));
    }
  };

  const handleLabelFilter = (label) => {
    setSelectedLabel(label);
    setCurrentPage(1);
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
    <View style={styles.filterButtons}>
      <TouchableOpacity onPress={() => handleLabelFilter('mama/papa')}>
        <Text style={selectedLabel === 'mama/papa' ? styles.activeButton : styles.filterButton}>Mama/Papa</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleLabelFilter('cry')}>
        <Text style={selectedLabel === 'cry' ? styles.activeButton : styles.filterButton}>Cry</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleLabelFilter('sleep/awake')}>
        <Text style={selectedLabel === 'sleep/awake' ? styles.activeButton : styles.filterButton}>Sleep/Awake</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleLabelFilter('body move')}>
        <Text style={selectedLabel === 'body move' ? styles.activeButton : styles.filterButton}>Body Move</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleLabelFilter('all')}>
        <Text style={selectedLabel === 'all' ? styles.activeButton : styles.filterButton}>All</Text>
      </TouchableOpacity>
    </View>
    </View>
  );

  
  
  const renderItem = ({ item }) => (
    <View style={[styles.row, { backgroundColor: getColorByLabel(item.label) }]}>
      <Text>{`Time: ${item.time}`}</Text>
      <Text>{`Label: ${item.label}`}</Text>
      
    </View>
  );
  
  const imageSources = {
    'defaultPicture': require('./defaultPicture.png'),
    'sleep': require('./sleep.png'),
    'awake': require('./awake.png'),
    // Add other potential images as necessary
  };  

  // Function to determine color based on label
  const getColorByLabel = (label) => {
    // You can customize this function based on your label-color mapping
    if (label === 'mama') {
      return 'salmon';
    }
    else if (label === 'papa') {
      return 'wheat';
    }
    else if (label === 'awake'){
      return 'blue';
    }
    else if (label === 'body move'){
      return 'lightgreen';
    }
    else if (label === 'sleep'){
      return 'purple'
    }
    else if (label === 'temperature rise'){
      return 'red';
    }
    else {
      return 'aqua'; // Default color or other mappings
    }
  };

  
  return (
    <View style={styles.container}>
      <View style={styles.tempContainer}>
      <Text style={styles.temperatureText}>{`Temperature : ${temperature}°C on ${temperatureTime.slice(-8)}`}</Text>
      <Image source={imageSources[picture]} style={styles.icon} />
    </View>
      <View style={styles.contentContainer}>
        {renderFilterButtons()}
        <Text style={styles.Notification}>Notifications:</Text>
        {loading ? ( // Render loading indicator if loading is true
          <View style={styles.loadingContainer}>
          <ActivityIndicator style = {styles.activityIndicator} size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Stay still</Text>
          <Text style={styles.loadingText}>while we retrieve</Text>
          <Text style={styles.loadingText}>your precious data</Text>
        </View>
          
        ) : (
          <FlatList
            data={itemsForCurrentPage}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            onEndReachedThreshold={0.1}
          />)}
          
      </View>
      <View style = {styles.cryButton}>
      <TouchableOpacity 
                onPress={() => {
                    if (playableFlag === 1) {
                        playAudio(addr); // Here you would call your audio play function
                    }
                }}
                style={[styles.playButton, playableFlag === 0 ? styles.disabledButton : styles.enabledButton]}
                disabled={playableFlag === 0}
            >
                <Text style={styles.cryText}>{playableFlag === 1 ? 'Play Last Cry' : '     Loading...'}</Text>
            </TouchableOpacity>
      </View>
      <View style={styles.pageNavigation}>
        <Text>{`Page ${currentPage}`}</Text>
        <TouchableOpacity onPress={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}>
          <Text>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() =>  setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))}>
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

};

const styles = StyleSheet.create({
  container:{
    flex:1,
  },
  contentContainer: {
    flex: 1,
    
  },
  tempContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // Add padding for visual spacing
  },
  cryButton: {
    marginLeft : 85,
    marginBottom : 100,
  },
  cryText: {
    fontSize: 30,
  },
  temperatureText: {
    fontSize: 18,
    marginLeft: 20, // Space between text and image
    
    marginTop : 30,
    marginBottom: -50
  },
  icon: {
    width: 50,
    height: 50,
    marginTop : 30,
    marginBottom : -50,
    marginRight : 30
  },
  filterContainer: {
    marginTop: 40, // Adjust the margin as needed
    
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10

  },
  Notification: {
    marginLeft : 10

  },
  loadingContainer: {
    flex :1, 
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20
  },
  filterButton: {
    padding: 10,
    color: 'black',
  },
  activeButton: {
    padding: 10,
    color: 'red', // Customize the color for active button as needed
    fontWeight: 'bold',
  },
  row: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1, 
    borderColor: '#ddd',
  },
  successfulRow: {
    backgroundColor: 'red',
  },
  pageNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  activityIndicator: {
    marginBottom : 20

  }
});

export default Main_Screen;