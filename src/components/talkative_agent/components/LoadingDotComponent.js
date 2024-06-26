import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";

const defaultColors = ["#4dabf7", "#3bc9db", "#38d9a9", "#69db7c"];

function LoadingDotComponent({
    dots = 4,
    colors = defaultColors,
    size = 20,
    bounceHeight = 20,
    borderRadius,
    components = null,
}) {
    const [animations, setAnimations] = useState([]);
    const [reverse, setReverse] = useState(false);

    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const dotAnimations = [];
        let animationsAmount =
            !!components && Array.isArray(components)
                ? components.length
                : dots;
        for (let i = 0; i < animationsAmount; i++) {
            dotAnimations.push(new Animated.Value(0));
        }
        setAnimations(dotAnimations);
    }, []);

    useEffect(() => {
        if (animations.length === 0) return;
        loadingAnimation(animations, reverse);
        appearAnimation();
    }, [animations]);

    function appearAnimation() {
        Animated.timing(opacity, {
            toValue: 1,
            easing: Easing.ease,
            useNativeDriver: true,
        }).start();
    }

    function floatAnimation(node, reverseY, delay) {
        const floatSequence = Animated.sequence([
            Animated.timing(node, {
                toValue: reverseY ? bounceHeight : -bounceHeight,
                easing: Easing.bezier(0.41, -0.15, 0.56, 1.21),
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(node, {
                toValue: reverseY ? -bounceHeight : bounceHeight,
                easing: Easing.bezier(0.41, -0.15, 0.56, 1.21),
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(node, {
                toValue: 0,
                delay,
                useNativeDriver: true,
            }),
        ]);
        return floatSequence;
    }

    function loadingAnimation(nodes, reverseY) {
        Animated.parallel(
            nodes.map((node, index) =>
                floatAnimation(node, reverseY, index * 100)
            )
        ).start(() => {
            setReverse(!reverse);
        });
    }

    useEffect(() => {
        if (animations.length === 0) return;
        loadingAnimation(animations, reverse);
    }, [reverse, animations]);

    return (
        <View
            style={{
                paddingVertical: 50,
                width: "20%",
                alignSelf: "center",
            }}
        >
            <Animated.View style={[styles.loading, { opacity }]}>
                {animations.map((animation, index) =>
                    components ? (
                        <Animated.View
                            key={`loading-anim-${index}`}
                            style={[{ transform: [{ translateY: animation }] }]}
                        >
                            {components[index]}
                        </Animated.View>
                    ) : (
                        <Animated.View
                            key={`loading-anim-${index}`}
                            style={[
                                {
                                    width: size,
                                    height: size,
                                    borderRadius: borderRadius || size / 2,
                                },
                                { backgroundColor: colors[index] || "#4dabf7" },
                                { transform: [{ translateY: animation }] },
                            ]}
                        />
                    )
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    loading: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});

export default LoadingDotComponent;
