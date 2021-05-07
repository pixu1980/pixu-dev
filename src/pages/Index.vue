<template>
  <Layout>
    <About />
    <hr />
    <Education />
    <hr />
    <Skills />
    <hr />
    <Projects />
    <hr />
    <Awards />
    <hr />
    <Experience />
    <hr />
    <Interests />
  </Layout>
</template>

<script>
import About from "../components/About";
import Education from "../components/Education";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Awards from "../components/Awards";
import Experience from "../components/Experience";
import Interests from "../components/Interests";

export default {
  components: {
    About,
    Education,
    Skills,
    Projects,
    Awards,
    Experience,
    Interests,
  },
  metaInfo: {
    title: "Home",
    titleTemplate: "%s - Pixu Resume",
  },
};
</script>
