const ProviderVideoVisitPage: React.FC = () => {
    return (
      <ProviderLayout>
        <Head>
          <title>Telehealth Session</title>
        </Head>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto p-6 space-y-6"
          aria-label="Telehealth Video Visit"
        >
          <h1 className="text-2xl font-bold text-gray-900">Telehealth Session</h1>
          <ProviderCameraPanel />
        </motion.div>
      </ProviderLayout>
    );
  };
  
  export default ProviderVideoVisitPage;
  