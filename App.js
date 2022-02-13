/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Linking,
  PermissionsAndroid,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import QRCode from 'react-native-qrcode-svg';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import Contacts from 'react-native-contacts';

function Home({navigation}) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Home Screen</Text>
      <Button
        title="Go to QRGenerator"
        onPress={() => navigation.navigate('Generator')}
      />
    </View>
  );
}

function QrGenerator({navigation}) {
  const [inputText, setInputText] = useState('');
  const [qrValue, setQrValue] = useState('');

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.containerQr}>
        <QRCode
          value={qrValue ? qrValue : 'NA'}
          size={250}
          color={'black'}
          backgroundColor="white"
          logoSize={30}
          logoMargin={2}
          logoBorderRadius={15}
          logoBackgroundColor="yellow"
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.text}>
          Insira qualquer valor para gerar o QR Code
        </Text>
        <TextInput
          style={styles.textInput}
          onChangeText={inputText => setInputText(inputText)}
          value={inputText}
        />
        <View style={{margin: 10}}>
          <Button onPress={() => setQrValue(inputText)} title="Gerar QR Code" />
          <Button
            title="Go to Home"
            onPress={() => navigation.navigate('Home')}
          />
          <Button
            title="Go to QRScanner"
            onPress={() => navigation.navigate('Scanner')}
          />
          <Button title="Go back" onPress={() => navigation.goBack()} />
          <Button
            title="Go back to first screen in stack"
            onPress={() => navigation.popToTop()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function QrScanner() {
  const [qr, setQr] = useState('');

  const newPerson = {
    givenName: 'Lari',
    phoneNumbers: [
      {
        label: 'mobile',
        number: '(555) 555-5555',
      },
    ],
  };

  const onSuccess = e => {
    Linking.openURL(e.data).catch(err =>
      console.error('An error occured', err),
    );
  };

  const onRead = e => {
    setQr(e.data);
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS, {
      title: 'Contacts',
      message: 'This app would like to view your contacts.',
      buttonPositive: 'Please accept bare mortal',
    })
      .then(
        Contacts.addContact(newPerson),
        Linking.openURL(
          'whatsapp://send?text=hello&phone=+55 (71) 982435206',
        ).catch(err => console.error('An error occured', err)),
      )
      .catch(e => {
        console.log(e);
      });
  };

  return (
    <View>
      <QRCodeScanner
        onRead={onRead}
        flashMode={RNCamera.Constants.FlashMode.off}
        topContent={
          <Text style={styles.centerText}>
            Go to{' '}
            <Text style={styles.textBold}>wikipedia.org/wiki/QR_code</Text> on
            your computer and scan the QR code.
          </Text>
        }
      />
      {qr != '' && (
        <TouchableOpacity style={styles.buttonTouchable}>
          <Text style={styles.buttonText}>{qr}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const Stack = createNativeStackNavigator();

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Generator" component={QrGenerator} />
        <Stack.Screen name="Scanner" component={QrScanner} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  containerQr: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 5,
  },
  textInput: {
    flexDirection: 'row',
    height: 40,
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    margin: 10,
    borderWidth: 1,
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
});

export default App;
