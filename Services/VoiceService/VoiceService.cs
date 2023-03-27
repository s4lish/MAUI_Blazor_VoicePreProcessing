using Services.DTO;

namespace Services.VoiceService
{
    public class VoiceService : IVoiceService
    {
        public async Task<bool> Upload(Voiceinfo voiceinfo)
        {
            if (voiceinfo.VoiceFile is null)
            {
                return false;
            }

            try
            {
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

                return true;

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
