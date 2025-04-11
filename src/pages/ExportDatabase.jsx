
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Download, Database, Archive, CheckCircle, Loader2, Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Member } from "@/api/entities";
import { Message } from "@/api/entities";
import { Settings } from "@/api/entities";
import { ActionCard } from "@/api/entities";
import { Venture } from "@/api/entities";
import { User } from "@/api/entities";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

export default function ExportDatabase() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const [exportComplete, setExportComplete] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress("Preparing export...");
    setExportComplete(false);

    try {
      // Get current user to verify permissions
      const currentUser = await User.me();
      
      // Check if user is admin (from User entity)
      if (currentUser.role !== 'admin') {
        toast({
          variant: "destructive",
          title: "Permission denied",
          description: "Only administrators can export database"
        });
        setIsExporting(false);
        return;
      }

      // Continue with export...
      setExportProgress("Fetching member data...");
      const allMembers = await Member.list();
      
      setExportProgress("Fetching messages...");
      const allMessages = await Message.list();
      
      setExportProgress("Fetching settings...");
      const allSettings = await Settings.list();
      
      setExportProgress("Fetching action cards...");
      const allActionCards = await ActionCard.list();
      
      setExportProgress("Fetching ventures...");
      const allVentures = await Venture.list();
      
      setExportProgress("Packaging data...");

      // Create JSON files for each entity
      const exportData = {
        "members.json": JSON.stringify(allMembers, null, 2),
        "messages.json": JSON.stringify(allMessages, null, 2),
        "settings.json": JSON.stringify(allSettings, null, 2),
        "action_cards.json": JSON.stringify(allActionCards, null, 2),
        "ventures.json": JSON.stringify(allVentures, null, 2),
        "export_info.json": JSON.stringify({
          date: new Date().toISOString(),
          exported_by: currentUser.email,
          entity_counts: {
            members: allMembers.length,
            messages: allMessages.length,
            settings: allSettings.length,
            action_cards: allActionCards.length,
            ventures: allVentures.length
          }
        }, null, 2)
      };

      // Instead of using jszip, create a single JSON file
      const exportContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([exportContent], { type: "application/json" });
      
      // Create download link
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `community_hub_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(downloadLink);
      
      // Trigger download
      setExportProgress("Starting download...");
      downloadLink.click();
      
      // Clean up
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);
      
      setExportComplete(true);
      setExportProgress("Export completed successfully!");
      
      toast({
        title: "Export Complete",
        description: "Your database has been exported successfully."
      });
    } catch (error) {
      console.error("Error exporting database:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: `Error exporting database: ${error.message}`
      });
      setExportProgress(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress("Reading import file...");

    try {
      // Get current user to verify permissions
      const currentUser = await User.me();
      
      // Check if user is admin
      if (currentUser.role !== 'admin') {
        toast({
          variant: "destructive",
          title: "Permission denied",
          description: "Only administrators can import database"
        });
        setIsImporting(false);
        return;
      }

      // Read the JSON file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importData = JSON.parse(e.target.result);

          // Validate the import data structure
          const requiredEntities = ['members.json', 'messages.json', 'settings.json', 'action_cards.json', 'ventures.json'];
          const missingEntities = requiredEntities.filter(entity => !importData[entity]);
          
          if (missingEntities.length > 0) {
            throw new Error(`Invalid import file. Missing entities: ${missingEntities.join(', ')}`);
          }

          // Parse each entity's JSON string
          const members = JSON.parse(importData['members.json']);
          const messages = JSON.parse(importData['messages.json']);
          const settings = JSON.parse(importData['settings.json']);
          const actionCards = JSON.parse(importData['action_cards.json']);
          const ventures = JSON.parse(importData['ventures.json']);

          // Import settings first
          setImportProgress("Importing settings...");
          for (const setting of settings) {
            const cleanedSetting = { ...setting };
            delete cleanedSetting.id;
            delete cleanedSetting.created_date;
            delete cleanedSetting.updated_date;
            delete cleanedSetting.created_by;
            await Settings.create(cleanedSetting);
          }

          // Import members
          setImportProgress("Importing members...");
          for (const member of members) {
            const cleanedMember = { ...member };
            delete cleanedMember.id;
            delete cleanedMember.created_date;
            delete cleanedMember.updated_date;
            delete cleanedMember.created_by;
            await Member.create(cleanedMember);
          }

          // Import action cards
          setImportProgress("Importing action cards...");
          for (const card of actionCards) {
            const cleanedCard = { ...card };
            delete cleanedCard.id;
            delete cleanedCard.created_date;
            delete cleanedCard.updated_date;
            delete cleanedCard.created_by;
            await ActionCard.create(cleanedCard);
          }

          // Import ventures
          setImportProgress("Importing ventures...");
          for (const venture of ventures) {
            const cleanedVenture = { ...venture };
            delete cleanedVenture.id;
            delete cleanedVenture.created_date;
            delete cleanedVenture.updated_date;
            delete cleanedVenture.created_by;
            await Venture.create(cleanedVenture);
          }

          // Import messages
          setImportProgress("Importing messages...");
          for (const message of messages) {
            const cleanedMessage = { ...message };
            delete cleanedMessage.id;
            delete cleanedMessage.created_date;
            delete cleanedMessage.updated_date;
            delete cleanedMessage.created_by;
            await Message.create(cleanedMessage);
          }

          setImportProgress("Import completed successfully!");
          toast({
            title: "Import Complete",
            description: "Database has been restored successfully."
          });

          // Reload the page to reflect changes
          setTimeout(() => {
            window.location.reload();
          }, 2000);

        } catch (error) {
          console.error("Error processing import:", error);
          toast({
            variant: "destructive",
            title: "Import Failed",
            description: `Error processing import: ${error.message}`
          });
           setIsImporting(false);
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Error importing database:", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: `Error importing database: ${error.message}`
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-[#6B4F4F]">Export Database</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Export & Import
              </CardTitle>
              <CardDescription>
                Export all community data or restore from a backup file
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                <AlertTitle className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Important Information
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-2">
                    This will export all community data including members, messages, settings, action cards, and ventures into a downloadable JSON file.
                  </p>
                  <p>
                    The export will not include user account information, passwords, or authentication data, but will include member profiles and related content.
                  </p>
                </AlertDescription>
              </Alert>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 mb-1">Data includes:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Members information
                    </li>
                    <li className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Messages between members
                    </li>
                    <li className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      System settings
                    </li>
                    <li className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Action cards
                    </li>
                    <li className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      Ventures
                    </li>
                  </ul>
                </div>
                
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  size="lg"
                  className="bg-[#339085] hover:bg-[#2A7268]"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Export Database
                    </>
                  )}
                </Button>
              </div>
              
              {exportProgress && (
                <div className={`mt-4 p-4 rounded-lg ${
                  exportComplete 
                    ? "bg-green-50 text-green-700 border border-green-200" 
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  {exportComplete ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      {exportProgress}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {exportProgress}
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t pt-6">
              <div className="w-full">
                <Label htmlFor="importFile" className="text-lg font-semibold mb-4 block">
                  Import Database
                </Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label 
                      htmlFor="importFile"
                      className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <div className="text-center">
                          <span className="font-medium text-gray-600">
                            Drop backup file here, or click to select
                          </span>
                          <p className="text-xs text-gray-500">
                            Only .json files exported from this system are supported
                          </p>
                        </div>
                      </div>
                      <input
                        id="importFile"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleImport}
                        disabled={isImporting}
                      />
                    </label>
                  </div>
                </div>

                {importProgress && (
                  <div className="mt-4 p-4 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {importProgress}
                    </div>
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Export Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Secure Storage</h3>
                <p className="text-sm text-gray-600">
                  Store the exported file in a secure location. It contains sensitive community data.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Regular Backups</h3>
                <p className="text-sm text-gray-600">
                  Export your database regularly to prevent data loss.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Restoration</h3>
                <p className="text-sm text-gray-600">
                  Use the import feature to restore your data from a previously exported file.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
