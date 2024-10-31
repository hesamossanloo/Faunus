import Comment from "@/components/Comment";
import SelectedBottomSheet from "@/components/SelectedBottomSheet";
import { useProperty } from "@/providers/PropertyProvider";
import { auth, db } from "@/services/firebaseConfig";
import Mapbox, {
  Camera,
  FillLayer,
  LocationPuck,
  MapView,
  RasterLayer,
  RasterSource,
  ShapeSource,
} from "@rnmapbox/maps";
import { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import * as Location from "expo-location";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_KEY ?? "");

type CameraBounds = {
  ne: [number, number];
  sw: [number, number];
};

export default function MapScreen() {
  const [geoJsonData, setGeoJsonData] =
    useState<GeoJSON.FeatureCollection | null>(null);
  const [cameraBounds, setCameraBounds] = useState<CameraBounds | null>(null);
  const [fillColor, setFillColor] = useState("rgba(0, 0, 255, 0.5)");
  const [fillOutlineColor, setFillOutlineColor] = useState("blue");
  const [comment, setComment] = useState("");
  const [isSkogbruksplanLayerVisible, setIsSkogbruksplanLayerVisible] =
    useState(true);
  const [isForestTeigLayerVisible, setIsForestTeigLayerVisible] =
    useState(true);

  const {
    isShapeSelected,
    toggleShapeSelection,
    isCommentVisible,
    setCommentVisible,
  } = useProperty();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }
    })();
  }, []);

  useEffect(() => {
    // Get the currently logged-in user from Firebase Auth
    const user = auth.currentUser;

    // Fetch user-specific data from Firestore if the user is logged in
    if (user) {
      fetchUserData(user.uid);
    }
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.forest && data.forest.teig) {
          // Parse and validate GeoJSON data
          const geoJson = JSON.parse(data.forest.teig);

          if (geoJson.type === "FeatureCollection" && geoJson.features) {
            console.log("GeoJSON features length: ", geoJson.features.length);
            setGeoJsonData(geoJson);
          } else {
            Alert.alert("Invalid GeoJSON format");
            return;
          }

          const bounds = data.forest.bounds;
          if (bounds && bounds._northEast && bounds._southWest) {
            setCameraBounds({
              ne: [bounds._northEast.lng, bounds._northEast.lat],
              sw: [bounds._southWest.lng, bounds._southWest.lat],
            });
          } else {
            Alert.alert("Bounds data is missing or incorrectly formatted");
          }
        } else {
          Alert.alert("No forest.teig data found in the document");
        }
      } else {
        Alert.alert("No document found for the user");
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  const handleShapePress = (event: OnPressEvent) => {
    const feature: GeoJSON.Feature = event.features[0]; // Assuming we want the first feature
    if (feature && feature.geometry) {
      const bounds = calculateBoundingBox(feature);
      setCameraBounds(bounds);
      if (isShapeSelected) {
        setFillColor("rgba(0, 0, 255, 0.5)");
        setFillOutlineColor("blue");
        setCommentVisible(false);
      } else {
        setFillColor("rgba(255, 255, 0, 0.5)");
        setFillOutlineColor("yellow");
      }
      toggleShapeSelection();
    }
  };

  const calculateBoundingBox = (feature: GeoJSON.Feature) => {
    if (!feature.geometry || !("coordinates" in feature.geometry)) {
      return null;
    }
    const flatCoordinates = feature.geometry.coordinates.flat(2) as number[];
    const lats = flatCoordinates.filter((_, i) => i % 2 === 1);
    const lngs = flatCoordinates.filter((_, i) => i % 2 === 0);
    const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)];
    const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)];
    return { ne, sw };
  };

  return (
    <>
      <MapView
        style={styles.map}
        styleURL="mapbox://styles/mapbox/satellite-v9"
        scaleBarEnabled={false}
      >
        {cameraBounds && (
          <Camera
            bounds={{
              ne: cameraBounds.ne,
              sw: cameraBounds.sw,
            }}
            padding={{
              paddingLeft: 50,
              paddingRight: 50,
              paddingTop: 50,
              paddingBottom: 50,
            }}
            animationDuration={1000}
          />
        )}
        <LocationPuck
          puckBearingEnabled
          puckBearing="heading"
          pulsing={{ isEnabled: true }}
        />
        {isForestTeigLayerVisible && geoJsonData && (
          <ShapeSource
            id="forestTeig"
            shape={geoJsonData}
            tolerance={0.1}
            onPress={handleShapePress}
          >
            <FillLayer
              id="forestTeigLayer"
              style={{
                fillColor: fillColor,
                fillOutlineColor: fillOutlineColor,
              }}
            />
          </ShapeSource>
        )}
        {isSkogbruksplanLayerVisible && (
          <RasterSource
            id="skogbruksplanSource"
            tileUrlTemplates={[
              "https://wms.nibio.no/cgi-bin/skogbruksplan?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=hogstklasser",
            ]}
            tileSize={256}
          >
            <RasterLayer
              id="skogbruksplanLayer"
              sourceID="skogbruksplanSource"
              style={{ rasterOpacity: 0.8 }}
              belowLayerID="forestTeigLayer" // Ensure this layer is above the Skogbruksplan layer
            />
          </RasterSource>
        )}
      </MapView>
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
      {isCommentVisible && (
        <Comment comment={comment} setComment={setComment} />
      )}
      <SelectedBottomSheet />
    </>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  button: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  layersMenu: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    elevation: 5,
  },
});
