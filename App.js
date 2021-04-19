import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Alert, ImageBackground, Modal, TouchableHighlight } from 'react-native'
import { Camera } from 'expo-camera'
import DropDownPicker from 'react-native-dropdown-picker';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [startCamera, setStartCamera] = React.useState(false)
  const [previewVisible, setPreviewVisible] = React.useState(false)
  const [capturedImage, setCapturedImage] = React.useState(false)
  const [cameraType, setCameraType] = React.useState(Camera.Constants.Type.back)
  const [flashMode, setFlashMode] = React.useState('off')
  const [modalVisible, setModalVisible] = React.useState(false);
  const [problem, setProblem] = React.useState(false);

  const __startCamera = async () => {
    const { status } = await Camera.requestPermissionsAsync()
    console.log(status)
    if (status === 'granted') {
      setStartCamera(true)
    } else {
      Alert.alert('Access denied')
    }
  }
  const __takePicture = async () => {
    const photo = await camera.takePictureAsync()
    setPreviewVisible(true)
    //setStartCamera(false)
    setCapturedImage(photo)
  }
  const __savePhoto = async () => {

    await fetch(`https://api-marijuana.herokuapp.com/user-photos`, {
      method: "POST",
      body: JSON.stringify({
        "status": "pending",
        "published_at": "2021-04-19T01:30:56.965Z",
        "created_by": "string",
        "updated_by": "string"
      })
    })
      .then(async (res) => {
        if (res.status !== 200) {
          console.error("request distinto de 200")
          alert("No se pudo enviar la publicacion. Intente nuevamente mas tarde.");
        } else {

          let data = await res.json();
          console.log(capturedImage);
          const form = new FormData();

          console.log("photo");
          let imgBlob = await (await fetch(capturedImage.uri)).blob()
          
          form.append('files', imgBlob,"4B24A11C-5B65-40F4-A55D-0F7067AF2A32");
          form.append('ref', 'user-photos');
          form.append("source","users-permissions");
          form.append('refId', data._id);
          form.append('field', 'media');

          await fetch(`https://api-marijuana.herokuapp.com/upload`, {
            method: "POST",
            headers: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
            },
            body: form
          })
            .then(async (res) => {
              if (res.status !== 200) {
                var data = await res.json();
                console.log(data);
                console.log("hola")
                alert("No se pudo subir correctamene las imagenes. Intente nuevamente mas tarde.");
              }
            })
        }
      })
      .catch(async (err) => {
        console.log(`Fallo en enviar info \n`, err)
        alert("Se produjo el siguiente error tecnico: " + err);
      });

    alert("Imagen subida")



  }
  const __retakePicture = () => {
    setCapturedImage(null)
    setPreviewVisible(false)
    __startCamera()
  }
  const __handleFlashMode = () => {
    if (flashMode === 'on') {
      setFlashMode('off')
    } else if (flashMode === 'off') {
      setFlashMode('on')
    } else {
      setFlashMode('auto')
    }
  }
  const __switchCamera = () => {
    if (cameraType === 'back') {
      setCameraType('front')
    } else {
      setCameraType('back')
    }
  }
  return (
    <View style={styles.container}>
      {startCamera ? (
        <View
          style={{
            flex: 1,
            width: '100%'
          }}
        >
          {previewVisible && capturedImage ? (
            <CameraPreview photo={capturedImage} savePhoto={__savePhoto} retakePicture={__retakePicture} problem={problem} setProblem={setProblem} />
          ) : (
            <Camera
              type={cameraType}
              flashMode={flashMode}
              style={{ flex: 1 }}
              ref={(r) => {
                camera = r
              }}
            >
              <View
                style={{
                  flex: 1,
                  width: '100%',
                  backgroundColor: 'transparent',
                  flexDirection: 'row'
                }}
              >
                <View
                  style={{
                    position: 'absolute',
                    left: '5%',
                    top: '10%',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <TouchableOpacity
                    onPress={__handleFlashMode}
                    style={{
                      backgroundColor: flashMode === 'off' ? '#000' : '#fff',
                      borderRadius: '50%',
                      height: 25,
                      width: 25
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20
                      }}
                    >
                      ⚡️
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={__switchCamera}
                    style={{
                      marginTop: 20,
                      borderRadius: '50%',
                      height: 25,
                      width: 25
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20
                      }}
                    >
                      {cameraType === 'front' ? '🤳' : '📷'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    flexDirection: 'row',
                    flex: 1,
                    width: '100%',
                    padding: 20,
                    justifyContent: 'space-between'
                  }}
                >
                  <View
                    style={{
                      alignSelf: 'center',
                      flex: 1,
                      alignItems: 'center'
                    }}
                  >
                    <TouchableOpacity
                      onPress={__takePicture}
                      style={{
                        width: 70,
                        height: 70,
                        bottom: 0,
                        borderRadius: 50,
                        backgroundColor: '#fff'
                      }}
                    />
                  </View>
                </View>
              </View>
            </Camera>
          )}
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <TouchableOpacity
            onPress={__startCamera}
            style={{
              width: 130,
              borderRadius: 4,
              backgroundColor: '#14274e',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              height: 40
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              Take picture
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

const CameraPreview = ({ photo, retakePicture, savePhoto, problem, setProblem }) => {
  const handleProblem = (value) => {
    alert(problem)
    setProblem(value)
  }
  return (
    <View
      style={{
        backgroundColor: 'transparent',
        flex: 1,
        width: '100%',
        height: '100%'
      }}
    >
      <ImageBackground
        source={{ uri: photo && photo.uri }}
        style={{
          flex: 1
        }}
      >

        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            padding: 15,
            justifyContent: 'flex-end'
          }}
        >
          <View
            style={{
              flexDirection: 'column',
              padding: 15,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#fff'
            }}
          >
            <DropDownPicker
              placeholder="Seleccione un sintoma"
              items={[
                { label: 'Ojita verde', value: 'not bad' },
                { label: 'Roja', value: 'very bad' },
                { label: 'Muerte', value: 'bad' },
              ]}
              defaultValue={problem}
              containerStyle={{ width: 200, height: 40 }}
              style={{ backgroundColor: '#fafafa' }}
              itemStyle={{
                justifyContent: 'flex-start'
              }}
              dropDownStyle={{ backgroundColor: '#fafafa' }}
              onChangeItem={item => handleProblem(item.value)}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}
          >
            <TouchableOpacity
              onPress={retakePicture}
              style={{
                width: 130,
                height: 40,

                alignItems: 'center',
                borderRadius: 4
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 20
                }}
              >
                Re-take
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={savePhoto}
              style={{
                width: 130,
                height: 40,

                alignItems: 'center',
                borderRadius: 4
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 20
                }}
              >
                Send photo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  )
}