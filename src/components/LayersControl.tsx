import React, { FC } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LayersControlProps {
  isSkogbruksplanLayerVisible: boolean;
  setIsSkogbruksplanLayerVisible: (visible: boolean) => void;
  isForestTeigLayerVisible: boolean;
  setIsForestTeigLayerVisible: (visible: boolean) => void;
}

const LayersControl: FC<LayersControlProps> = ({
  isSkogbruksplanLayerVisible,
  setIsSkogbruksplanLayerVisible,
  isForestTeigLayerVisible,
  setIsForestTeigLayerVisible,
}) => {
  return (
    <View style={styles.layersMenu}>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          setIsSkogbruksplanLayerVisible(!isSkogbruksplanLayerVisible)
        }
      >
        <Text>Skogbruksplan</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ ...styles.button, marginTop: 5 }}
        onPress={() => setIsForestTeigLayerVisible(!isForestTeigLayerVisible)}
      >
        <Text>Matrikkel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  layersMenu: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    elevation: 5,
  },
  button: {
    backgroundColor: "lightblue",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});

export default LayersControl;
