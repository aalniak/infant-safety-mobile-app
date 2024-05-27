import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Here you would call your backend to authenticate the user
    // For now, let's just navigate to the main screen on any login attempt
    navigation.navigate('MainScreen' , { justLoggedIn: true }); // Adjust 'MainScreen' as needed for your app
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require('./logo.png')}
      />
      <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      /></View>
      <Button color = 'black' style={styles.button} title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    color: 'blue'
    
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0ab5c7'
  },
  input: {
    height: 40,
    marginBottom: 12,
    borderWidth: 1,
    padding: 10,
    borderColor: 'white',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
    
    alignSelf: 'center'
  },
});

export default LoginScreen;