using Entities;
using Services.DTO;
using SQLite;

namespace Services.VoiceService
{
    public class VoiceService : IVoiceService
    {
        SQLiteAsyncConnection Connection;
        private string fileName = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments) + @"/VoiceRecords.db";

        public VoiceService()
        {
            Connection = new SQLiteAsyncConnection(fileName);
        }

        public async Task CreateTables()
        {
            await Connection.CreateTableAsync<VoiceInformation>();
        }

        public async Task<bool> Upload(Voiceinfo voiceinfo)
        {
            if (voiceinfo.VoiceFile is null)
            {
                return false;
            }

            try
            {
                await CreateTables();

                string neFileName = Path.ChangeExtension(
                    Guid.NewGuid().ToString(),
                    Path.GetExtension(voiceinfo.VoiceFile.Name)
                );

                string path = Path.Combine(
                    AppDomain.CurrentDomain.BaseDirectory,
                    "Uploads",
                    neFileName
                );

                string relativePath = Path.Combine("Uploads", neFileName);

                Directory.CreateDirectory(Path.Combine(
                    AppDomain.CurrentDomain.BaseDirectory,
                    "Uploads"));


                await using FileStream fs = new(path, FileMode.Create);
                await voiceinfo.VoiceFile.OpenReadStream(maxAllowedSize: long.MaxValue).CopyToAsync(fs);

                VoiceInformation voiceInformation = new VoiceInformation
                {
                    VoiceFile = relativePath
                };

                var rowAdd = await Connection.InsertAsync(voiceInformation);

                return true;

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
